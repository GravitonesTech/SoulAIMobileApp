import { Typography } from "@/constants/Typography";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { haptics } from "@/utils/haptics";
import { normalize } from "@/utils/responsive";
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput = ({
  value,
  onChangeText,
  onSend,
  placeholder = "Ask me anything...",
  disabled = false,
}: ChatInputProps) => {
  // ─── Animations ───────────────────────────────────────────────────────────
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Wave visualizer bars (9 bars)
  const waveAnims = useRef(Array.from({ length: 9 }, () => new Animated.Value(1))).current;

  // ─── Speech Recognition ───────────────────────────────────────────────────
  const { isListening, isProcessing, volume, startListening, stopListening, cancelListening } =
    useSpeechRecognition({
      locale: "auto",
      onTranscript: (text) => {
        onChangeText(text);
      },
      onFinalTranscript: (text) => {
        onChangeText(text);
        haptics.success();
      },
      onError: (msg) => {
        console.warn("[ChatInput STT Error]", msg);
        haptics.error();
      },
    });

  // ─── Slide Sheet In / Out ─────────────────────────────────────────────────
  useEffect(() => {
    if (isListening) {
      // Dismiss keyboard immediately to transition to voice overlay
      Keyboard.dismiss();

      // Animate slide-up & backdrop fade-in
      Animated.parallel([
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate slide-down & backdrop fade-out
      Animated.parallel([
        Animated.timing(sheetTranslateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isListening, sheetTranslateY, backdropOpacity]);

  // ─── Real-Time Wave Visualizer Animation ──────────────────────────────────
  useEffect(() => {
    if (!isListening) {
      // Reset all bar animations
      waveAnims.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
      return;
    }

    // Animate wave heights dynamically with voice volume
    const animations = waveAnims.map((anim, index) => {
      // Shape the wave curve (middle bars scale higher)
      const positionFactor = 1 - Math.abs(index - 4) / 5; // 0.2 to 1.0
      // Scale is determined by: base scale (1) + scaled volume (max 6.0)
      const targetScale = 1 + volume * 6.5 * positionFactor * (0.7 + Math.random() * 0.6);

      return Animated.timing(anim, {
        toValue: targetScale,
        duration: 60,
        useNativeDriver: true,
      });
    });

    Animated.parallel(animations).start();
  }, [volume, isListening, waveAnims]);

  // ─── Trigger functions ────────────────────────────────────────────────────
  const handleMicPress = async () => {
    if (disabled) return;
    haptics.medium();
    await startListening();
  };

  const handleDone = () => {
    haptics.success();
    stopListening();
  };

  const handleCancel = () => {
    haptics.light();
    cancelListening();
  };

  // Color mappings for individual bars to form a beautiful gradient wave
  const barColors = [
    "#3C61DD",
    "#4B5BE0",
    "#5A55E3",
    "#694FE6",
    "#7849E9",
    "#8743EC",
    "#963DEF",
    "#A537F2",
    "#B431F5",
  ];

  return (
    <View style={styles.bottomBarContainer}>
      <View style={styles.bottomBar}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#747474"
            style={styles.input}
            onSubmitEditing={!disabled ? onSend : undefined}
            returnKeyType="send"
            editable={!isListening}
          />
        </View>

        {/* Mic trigger button */}
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.75}
          onPress={handleMicPress}
          disabled={disabled}
          accessibilityLabel="Start voice input"
          accessibilityRole="button"
        >
          <Feather name="mic" size={normalize(22)} color="#1C1C1E" />
        </TouchableOpacity>

        {/* Send text button */}
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onSend}
          disabled={disabled || value.trim().length === 0}
        >
          <Ionicons
            name="paper-plane-outline"
            size={normalize(26)}
            color={disabled || value.trim().length === 0 ? "#1C1C1E" : "#3C61DD"}
          />
        </TouchableOpacity>
      </View>

      {/* ─── ChatGPT-style Voice Recognition Sheet ─────────────────────────── */}
      <Modal
        transparent
        visible={isListening || isProcessing}
        animationType="none"
        onRequestClose={handleCancel}
      >
        <View style={styles.overlayContainer}>
          {/* Dimmed backdrop */}
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
          </Animated.View>

          {/* Slide-up Container */}
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            {/* Header controls */}
            <View style={styles.sheetHeader}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleCancel}
                accessibilityLabel="Cancel recording"
              >
                <Ionicons name="close" size={normalize(24)} color="#E15252" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Listening</Text>
              <TouchableOpacity
                style={[styles.headerButton, styles.doneButtonBg]}
                onPress={handleDone}
                accessibilityLabel="Complete recording"
              >
                <Ionicons name="checkmark" size={normalize(20)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Transcript display area */}
            <View style={styles.transcriptBox}>
              <Text
                style={[styles.transcriptText, !value.trim() && styles.placeholderText]}
                numberOfLines={5}
              >
                {value.trim() ? value : "Speak now..."}
              </Text>
            </View>

            {/* Dynamic Equalizer/Wave Visualizer */}
            <View style={styles.visualizerContainer}>
              <View style={styles.waveRow}>
                {waveAnims.map((anim, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: barColors[index] || "#3C61DD",
                        transform: [{ scaleY: anim }],
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBarContainer: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(20),
    paddingTop: normalize(8),
    backgroundColor: "transparent",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(6),
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    height: normalize(48),
    borderRadius: normalize(24),
    justifyContent: "center",
    paddingHorizontal: normalize(18),
  },
  input: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(15),
    color: "#1C1C1E",
  },
  iconButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    alignItems: "center",
    justifyContent: "center",
  },

  /* ─── Modal Sheet Styles ──────────────────────────────────────────────── */
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  sheetContainer: {
    backgroundColor: "#ecf7ff",
    borderTopLeftRadius: normalize(28),
    borderTopRightRadius: normalize(28),
    paddingTop: normalize(16),
    paddingBottom: normalize(40),
    paddingHorizontal: normalize(24),
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    maxHeight: SCREEN_HEIGHT * 0.45,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: normalize(16),
  },
  headerTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#747474",
  },
  headerButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonBg: {
    backgroundColor: "#3C61DD",
  },
  transcriptBox: {
    minHeight: normalize(80),
    maxHeight: normalize(120),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: normalize(24),
  },
  transcriptText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(20),
    color: "#1C1C1E",
    textAlign: "center",
    lineHeight: normalize(28),
  },
  placeholderText: {
    color: "#B4B4B4",
  },
  visualizerContainer: {
    height: normalize(60),
    justifyContent: "center",
    alignItems: "center",
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    height: normalize(40),
    gap: normalize(5),
  },
  waveBar: {
    width: normalize(4),
    height: normalize(8), // Base resting height
    borderRadius: normalize(2),
  },
});
