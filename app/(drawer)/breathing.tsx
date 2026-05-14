import { ChatInput } from "@/components/chat/ChatInput";
import { AppHeader } from "@/components/ui/AppHeader";
import { Typography } from "@/constants/Typography";
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  sender: "app" | "user";
};

const DURATION_OPTIONS = ["1 minute", "5 minutes", "10 minutes", "15 minutes"];
const PATTERN_OPTIONS = ["Box Breathing", "Relaxing", "Coherent", "4-7-8"];
const MUSIC_OPTIONS = ["No, I like silence", "Mindfulness", "Relaxing", "Nature"];

export default function BreathingExerciseScreen() {
  const [step, setStep] = useState(1);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "How long would you like to do this exercise for?", sender: "app" },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);
  const isKeyboardVisible = useKeyboardVisibility();

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      const text = inputText.trim();
      setInputText("");
      handleOptionSelect(text);
    }
  };

  const handleOptionSelect = (option: string) => {
    const userMessage: Message = { id: Date.now().toString(), text: option, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      if (step === 1) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: "What breathing pattern do you prefer?",
            sender: "app",
          },
        ]);
        setStep(2);
      } else if (step === 2) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: "Would you like a background music while you do the breathing exercise?",
            sender: "app",
          },
        ]);
        setStep(3);
      } else if (step === 3) {
        setStep(4);
      }
    }, 500);
  };

  const renderOptions = () => {
    let options: string[] = [];
    if (step === 1) options = DURATION_OPTIONS;
    else if (step === 2) options = PATTERN_OPTIONS;
    else if (step === 3) options = MUSIC_OPTIONS;

    if (step === 4) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsScrollContent}
        style={styles.optionsScroll}
      >
        {options.map((option, _index) => (
          <TouchableOpacity
            key={_index}
            style={styles.optionChip}
            onPress={() => handleOptionSelect(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <AppHeader title="Breathing Exercise" showBadge />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : isKeyboardVisible ? "height" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Meditating</Text>
            <Text style={styles.updateText}>Last Update: 12.02.26</Text>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.sender === "user" ? styles.userBubble : styles.appBubble,
                ]}
              >
                <Text style={[styles.messageText, msg.sender === "user" && styles.userMessageText]}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {renderOptions()}

        {step === 4 ? (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.beginButton} onPress={() => {}}>
              <Text style={styles.beginButtonText}>Begin Exercise</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ChatInput value={inputText} onChangeText={setInputText} onSend={handleSend} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F9FF",
  },
  header: {
    // Redundant but keeping placeholder if needed later
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
  },
  titleSection: {
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(24),
    color: "#000",
  },
  updateText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#999",
    marginTop: hp(0.5),
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: moderateScale(2),
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderRadius: normalize(16),
    marginBottom: hp(1.5),
  },
  appBubble: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    borderTopLeftRadius: normalize(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "#3C61DD",
    alignSelf: "flex-end",
    borderTopRightRadius: normalize(4),
  },
  messageText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(15),
    color: "#333",
    lineHeight: normalize(22),
  },
  userMessageText: {
    color: "#FFF",
  },
  optionsScroll: {
    maxHeight: hp(8),
  },
  optionsScrollContent: {
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(10),
    alignItems: "center",
  },
  optionChip: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    borderRadius: normalize(25),
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3C61DD",
  },
  optionText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#3C61DD",
  },
  footer: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: hp(4),
  },
  beginButton: {
    backgroundColor: "#3C61DD",
    height: moderateScale(56),
    borderRadius: normalize(28),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  beginButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#FFF",
  },
});
