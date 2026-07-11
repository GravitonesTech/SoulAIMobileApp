import BreathingAnimation from "@/components/breathing/BreathingAnimation";
import { BreathingOptions } from "@/components/breathing/BreathingOptions";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { AppButton } from "@/components/ui/AppButton";
import { AppHeader } from "@/components/ui/AppHeader";
import { Typography } from "@/constants/Typography";
import { ENDPOINTS } from "@/constants/endpoints";
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { useIsFocused } from "@react-navigation/native";
import { useAudioPlayer } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  sender: "assistant" | "user";
};

const DURATION_OPTIONS = ["1 minute", "5 minutes", "10 minutes", "15 minutes"];
const PATTERN_OPTIONS = ["Box Breathing", "Relaxing", "Coherent", "4-7-8"];
const MUSIC_OPTIONS = ["No, I like silence", "Mindfulness", "Relaxing", "Nature"];

const getStepFromBackend = (backendStep: string | null | undefined, config: any): number => {
  if (config) return 4;
  if (!backendStep) return 1;
  const normalized = backendStep.toLowerCase().trim();

  if (normalized.includes("duration")) {
    return 1;
  }
  if (normalized.includes("pattern")) {
    return 2;
  }
  if (normalized.includes("music")) {
    return 3;
  }
  if (normalized.includes("ready")) {
    return 4;
  }

  return 1;
};

export default function BreathingExerciseScreen() {
  const [step, setStep] = useState(1);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [patternOptions, setPatternOptions] = useState<string[]>(PATTERN_OPTIONS);
  const [breathingConfig, setBreathingConfig] = useState<any>(null);
  const isFocused = useIsFocused();

  const scrollViewRef = useRef<ScrollView>(null);
  const isKeyboardVisible = useKeyboardVisibility();

  // Breathing active state variables
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentBreathState, setCurrentBreathState] = useState<
    "inhale" | "hold_in" | "exhale" | "hold_out"
  >("inhale");
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [cycleSecondsRemaining, setCycleSecondsRemaining] = useState(4);

  // Audio Player for background music
  const soundUrl = breathingConfig?.recommended_sound?.sound;
  const player = useAudioPlayer(soundUrl || null);

  useEffect(() => {
    if (player) {
      player.loop = true;
    }
  }, [player]);

  useEffect(() => {
    if (!player) return;
    if (isExerciseActive && !isPaused) {
      try {
        player.play();
      } catch (e) {
        console.warn("[Breathing] Failed to play background music:", e);
      }
    } else {
      try {
        player.pause();
      } catch (e) {
        console.warn("[Breathing] Failed to pause background music:", e);
      }
    }
  }, [isExerciseActive, isPaused, player]);

  useEffect(() => {
    if (!isFocused && player) {
      try {
        player.pause();
        player.seekTo(0);
      } catch (e) {
        console.warn("[Breathing] Failed to pause player on blur:", e);
      }
    }
  }, [isFocused, player]);

  const breathScale = useRef(new Animated.Value(0)).current;
  const currentScaleVal = useRef(0);

  useEffect(() => {
    const id = breathScale.addListener(({ value }) => {
      currentScaleVal.current = value;
    });
    return () => breathScale.removeListener(id);
  }, []);

  const scale = breathScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });

  const outerScale1 = breathScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1.1, 3.6],
  });

  const outerScale2 = breathScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1.2, 4.8],
  });

  const outerScale3 = breathScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1.3, 6.0],
  });

  // Parse breathing config durations
  const inhaleDuration = breathingConfig?.pattern_detail?.inhale;
  const holdInDuration = breathingConfig?.pattern_detail?.hold_in;
  const exhaleDuration = breathingConfig?.pattern_detail?.exhale;
  const holdOutDuration = breathingConfig?.pattern_detail?.hold_out;
  const totalDuration = breathingConfig?.duration_seconds;

  const startSession = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.post<any>(ENDPOINTS.chat.sessions, {
        therapy_type: "breathing_exercise",
        title: "Breathing Exercise",
      });
      if (response.success && response.data) {
        setSessionId(response.data.session_id);
        setIsAnimating(true);
        setMessages([
          {
            id: response.data.session_id,
            text:
              response.data.greeting_message ||
              "Hello and welcome! Let's get your breathing exercise ready. Would you like a quick 1–3 minute session or something longer, like 5, 10, or 20 minutes?",
            sender: "assistant",
          },
        ]);
        if (response.data.breathing_step) {
          setStep(getStepFromBackend(response.data.breathing_step, response.data.breathing_config));
        }
        if (response.data.breathing_config) {
          setBreathingConfig(response.data.breathing_config);
        }
      } else {
        toast.error("Error", response.message || "Failed to start session");
      }
    } catch (error) {
      toast.error("Error", "Failed to start session");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBreathingPatterns = async () => {
    try {
      const response = await apiClient.get<any>(ENDPOINTS.master.breathingPatterns);
      if (response.success && Array.isArray(response.data)) {
        const names = response.data.map((item: any) => item.display_name);
        if (names.length > 0) {
          setPatternOptions(names);
        }
      }
    } catch (error) {
      console.error("[Breathing] Error fetching breathing patterns:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setStep(1);
      setInputText("");
      setBreathingConfig(null);
      startSession();
      fetchBreathingPatterns();
      breathScale.setValue(0);
      currentScaleVal.current = 0;
    } else {
      setIsExerciseActive(false);
      setIsPaused(false);
      stopBreathAnimation(true);
      setSecondsRemaining(0);
      setCycleSecondsRemaining(0);
    }
  }, [isFocused]);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  useEffect(() => {
    let interval: any = null;

    if (isExerciseActive && !isPaused) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsExerciseActive(false);
            stopBreathAnimation(true);
            toast.success("Completed", "Great job! You have completed the breathing exercise.");
            return 0;
          }
          return prev - 1;
        });

        setCycleSecondsRemaining((prevCycle) => {
          if (prevCycle <= 1) {
            Vibration.vibrate();
            // haptics.heavy();
            let nextState: "inhale" | "hold_in" | "exhale" | "hold_out" = "inhale";
            let nextDuration = inhaleDuration;

            if (currentBreathState === "inhale") {
              if (holdInDuration > 0) {
                nextState = "hold_in";
                nextDuration = holdInDuration;
              } else {
                nextState = "exhale";
                nextDuration = exhaleDuration;
              }
            } else if (currentBreathState === "hold_in") {
              nextState = "exhale";
              nextDuration = exhaleDuration;
            } else if (currentBreathState === "exhale") {
              if (holdOutDuration > 0) {
                nextState = "hold_out";
                nextDuration = holdOutDuration;
              } else {
                nextState = "inhale";
                nextDuration = inhaleDuration;
              }
            } else if (currentBreathState === "hold_out") {
              nextState = "inhale";
              nextDuration = inhaleDuration;
            }

            setCurrentBreathState(nextState);

            if (nextState === "inhale") {
              startInhaleAnimation(nextDuration);
            } else if (nextState === "exhale") {
              startExhaleAnimation(nextDuration);
            } else if (nextState === "hold_in") {
              breathScale.setValue(1);
            } else if (nextState === "hold_out") {
              breathScale.setValue(0);
            }

            return nextDuration;
          }
          return prevCycle - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isExerciseActive,
    isPaused,
    currentBreathState,
    inhaleDuration,
    holdInDuration,
    exhaleDuration,
    holdOutDuration,
  ]);

  const handleSend = () => {
    if (inputText.trim()) {
      const text = inputText.trim();
      setInputText("");
      handleOptionSelect(text);
    }
  };

  const handleOptionSelect = async (option: string) => {
    if (isLoading || isAnimating) return;
    setIsAnimating(false);

    const userMessage: Message = { id: Date.now().toString(), text: option, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiClient.post<any>(ENDPOINTS.chat.send, {
        session_id: sessionId || "",
        user_input: option,
        selected_therapy: "breathing_exercise",
      });

      if (response.success && response.data) {
        setIsAnimating(true);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: response.data.response || "",
            sender: "assistant",
          },
        ]);

        if (response.data.breathing_step) {
          const nextStep = getStepFromBackend(
            response.data.breathing_step,
            response.data.breathing_config,
          );
          setStep(nextStep);
        } else {
          setStep((prev) => prev + 1);
        }

        if (response.data.breathing_config) {
          setBreathingConfig(response.data.breathing_config);
        }
      } else {
        toast.error("Error", response.message || "Failed to send message");
      }
    } catch (error) {
      console.error("[Breathing] Error sending message:", error);
      toast.error("Error", "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const startInhaleAnimation = (duration: number, fromValue?: number) => {
    if (fromValue !== undefined) {
      breathScale.setValue(fromValue);
    }
    Animated.timing(breathScale, {
      toValue: 1,
      duration: duration * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const startExhaleAnimation = (duration: number, fromValue?: number) => {
    if (fromValue !== undefined) {
      breathScale.setValue(fromValue);
    }
    Animated.timing(breathScale, {
      toValue: 0,
      duration: duration * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const stopBreathAnimation = (resetToZero?: boolean) => {
    if (resetToZero) {
      breathScale.stopAnimation();
      breathScale.setValue(0);
      currentScaleVal.current = 0;
    } else {
      breathScale.stopAnimation((value) => {
        currentScaleVal.current = value;
      });
    }
  };

  const handleBeginExercise = () => {
    setIsExerciseActive(true);
    setIsPaused(false);
    setCurrentBreathState("inhale");

    setSecondsRemaining(totalDuration);
    setCycleSecondsRemaining(inhaleDuration);

    startInhaleAnimation(inhaleDuration, 0);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      if (currentBreathState === "inhale") {
        startInhaleAnimation(cycleSecondsRemaining, currentScaleVal.current);
      } else if (currentBreathState === "exhale") {
        startExhaleAnimation(cycleSecondsRemaining, currentScaleVal.current);
      }
    } else {
      setIsPaused(true);
      stopBreathAnimation();
    }
  };

  const handleCancel = () => {
    setIsExerciseActive(false);
    setIsPaused(false);
    stopBreathAnimation(true);
    setSecondsRemaining(0);
    setCycleSecondsRemaining(0);
    
    // Reset conversation and start a new session
    setMessages([]);
    setSessionId(null);
    setBreathingConfig(null);
    setStep(1);
    startSession();

    if (player) {
      try {
        player.pause();
        player.seekTo(0);
      } catch (e) {
        console.warn("[Breathing] Failed to reset player on cancel:", e);
      }
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#D4E1F8"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header */}
        <AppHeader title="Breathing Exercise" showBadge />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : isKeyboardVisible ? "height" : undefined}
          style={{ flex: 1 }}
        >
          {isExerciseActive ? (
            <View style={{ flex: 1, position: "relative" }}>
              <BreathingAnimation
                currentBreathState={currentBreathState}
                scale={scale}
                outerScale1={outerScale1}
                outerScale2={outerScale2}
                outerScale3={outerScale3}
              />
              {/* <View style={styles.debugOverlay}>
                <Text style={styles.debugText}>Remaining: {secondsRemaining}s</Text>
                <Text style={styles.debugText}>Cycle Remaining: {cycleSecondsRemaining}s</Text>
                <Text style={styles.debugText}>
                  Inhale: {inhaleDuration ?? 0}s | Hold-In: {holdInDuration ?? 0}s | Exhale:{" "}
                  {exhaleDuration ?? 0}s | Hold-Out: {holdOutDuration ?? 0}s
                </Text>
              </View> */}
            </View>
          ) : (
            <View style={styles.content}>
              {messages.length === 0 && isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3C61DD" />
                </View>
              ) : (
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.chatArea}
                  contentContainerStyle={styles.chatContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {messages.map((msg, index) => (
                    <ChatBubble
                      key={msg.id}
                      role={msg.sender === "user" ? "user" : "assistant"}
                      text={msg.text}
                      shouldAnimate={index === messages.length - 1 && msg.sender !== "user"}
                      onAnimationComplete={
                        index === messages.length - 1 && msg.sender !== "user"
                          ? () => setIsAnimating(false)
                          : undefined
                      }
                    />
                  ))}
                  {messages.length > 0 && isLoading && <TypingIndicator />}
                </ScrollView>
              )}
            </View>
          )}

          {!isExerciseActive && sessionId !== null && (
            <BreathingOptions
              step={step}
              durationOptions={DURATION_OPTIONS}
              patternOptions={patternOptions}
              musicOptions={MUSIC_OPTIONS}
              isAnimating={isAnimating}
              isLoading={isLoading}
              onOptionSelect={handleOptionSelect}
            />
          )}

          {isExerciseActive ? (
            isPaused ? (
              <View style={styles.pausedButtonsContainer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <AppButton
                  title="Continue"
                  onPress={handlePauseResume}
                  style={styles.continueButton}
                />
              </View>
            ) : (
              <View style={styles.footer}>
                <AppButton title="Pause" onPress={handlePauseResume} style={styles.pauseButton} />
              </View>
            )
          ) : (
            sessionId !== null &&
            (step === 4 ? (
              <View style={styles.footer}>
                <AppButton
                  title="Begin Exercise"
                  onPress={handleBeginExercise}
                  disabled={isAnimating || isLoading}
                  style={styles.beginButton}
                  textStyle={styles.beginButtonText}
                />
              </View>
            ) : (
              <ChatInput
                value={inputText}
                onChangeText={setInputText}
                onSend={handleSend}
                disabled={isAnimating || isLoading}
              />
            ))
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: moderateScale(2),
  },

  footer: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: hp(3),
  },
  pausedButtonsContainer: {
    flexDirection: "row",
    gap: normalize(12),
    paddingHorizontal: moderateScale(20),
    paddingBottom: hp(3),
  },
  cancelBtn: {
    flex: 1,
    height: moderateScale(56),
    borderRadius: normalize(28),
    borderWidth: 1.5,
    borderColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  cancelBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#FF3B30",
  },
  continueButton: {
    flex: 1,
    height: moderateScale(56),
    borderRadius: normalize(28),
  },
  pauseButton: {
    height: moderateScale(56),
    borderRadius: normalize(28),
  },
  beginButton: {
    height: moderateScale(56),
    borderRadius: normalize(28),
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  beginButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
  },
  debugOverlay: {
    position: "absolute",
    top: normalize(20),
    left: normalize(20),
    right: normalize(20),
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: normalize(12),
    borderRadius: normalize(8),
    alignItems: "center",
    zIndex: 9999,
  },
  debugText: {
    color: "#FFFFFF",
    fontSize: normalize(14),
    fontFamily: Typography.fonts.regular,
    marginVertical: normalize(2),
  },
});
