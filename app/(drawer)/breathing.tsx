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
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
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
  if (
    normalized.includes("begin") ||
    normalized.includes("start") ||
    normalized.includes("complete") ||
    normalized.includes("finish") ||
    normalized.includes("config")
  ) {
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

  const handleSend = () => {
    if (inputText.trim()) {
      const text = inputText.trim();
      setInputText("");
      handleOptionSelect(text);
    }
  };

  const handleOptionSelect = async (option: string) => {
    if (isLoading || isAnimating) return;
    setIsAnimating(true);

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
        handleFallback();
      }
    } catch (error) {
      console.error("[Breathing] Error sending message:", error);
      handleFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallback = () => {
    if (step === 1) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "What breathing pattern do you prefer?",
          sender: "assistant",
        },
      ]);
      setStep(2);
    } else if (step === 2) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Would you like a background music while you do the breathing exercise?",
          sender: "assistant",
        },
      ]);
      setStep(3);
    } else if (step === 3) {
      setStep(4);
      setIsAnimating(false);
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
                    shouldAnimate={msg.sender !== "user"}
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

          {sessionId !== null && (
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

          {sessionId !== null &&
            (step === 4 ? (
              <View style={styles.footer}>
                <AppButton
                  title="Begin Exercise"
                  onPress={() => {
                    console.log(
                      "[Breathing] Beginning exercise with session:",
                      sessionId,
                      "config:",
                      breathingConfig,
                    );
                  }}
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
            ))}
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
});
