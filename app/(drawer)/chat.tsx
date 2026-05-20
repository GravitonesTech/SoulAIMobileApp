import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility";
import { apiClient } from "@/utils/api";
import { normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { isCancel } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export default function ChatScreen() {
  const { therapy, initialMessage, sessionId, selected_therapy } = useLocalSearchParams<{
    therapy?: string;
    initialMessage?: string;
    sessionId?: string;
    selected_therapy?: string;
  }>();

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isKeyboardVisible = useKeyboardVisibility();
  const scrollViewRef = useRef<ScrollView>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Reset all messages and state when the session/path changes to prevent
    // stale animation or loading flags from locking the chat inputs.
    setMessages([]);
    setIsLoading(false);
    setIsAnimating(false);
    setInputText("");

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [sessionId, therapy, selected_therapy]);

  useEffect(() => {
    if (initialMessage) {
      console.log("Initial message:", initialMessage);
      handleSend(initialMessage);
    }
  }, [initialMessage, sessionId]);

  const handleSend = async (textOverride?: string | any) => {
    const trimmed = typeof textOverride === "string" ? textOverride : inputText.trim();
    const isProgrammatic = typeof textOverride === "string";
    if (!trimmed) return;

    // Programmatic sends (like initialMessage) shouldn't be blocked by stale loading/animating states
    if (!isProgrammatic && (isLoading || isAnimating)) return;

    // Cancel any previous ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: ChatMessage = {
      id: `m-${Date.now()}-u`,
      role: "user",
      text: trimmed,
    };

    if (typeof textOverride === "string") {
      setMessages([userMessage]);
    } else {
      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
    }
    setIsLoading(true);

    try {
      const response = await apiClient.post(
        ENDPOINTS.chat.send,
        {
          session_id: "",
          user_input: trimmed,
          selected_model: "claude",
          selected_therapy: selected_therapy?.toLowerCase() || "",
        },
        {
          signal: controller.signal,
        },
      );

      // Guard against updating state after request is aborted
      if (controller.signal.aborted) {
        return;
      }

      if (response.success && response.data) {
        const aiResponse = response.data.response;
        const assistantMessage: ChatMessage = {
          id: `m-${Date.now()}-a`,
          role: "assistant",
          text: aiResponse,
        };
        setIsAnimating(true);
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error("Error", response.message || "Failed to get response from AI");
      }
    } catch (error) {
      if (isCancel(error)) {
        console.log("[Chat] Request cancelled:", error.message);
        return;
      }
      console.error("[Chat] Error sending message:", error);
      toast.error("Error", "A network error occurred. Please try again.");
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleNewChatPress = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([]);
    setIsLoading(false);
    setIsAnimating(false);
    setInputText("");
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === "ios" ? "padding" : isKeyboardVisible ? "height" : undefined}
        >
          {/* Header */}
          <AppHeader
            title={therapy ? therapy : undefined}
            showBadge={therapy ? true : false}
            onNewChatPress={!therapy ? handleNewChatPress : undefined}
            // isNewChatDisabled={isAnimating || isLoading}
          />

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.flex1}
            contentContainerStyle={[
              styles.messagesContent,
              messages.length === 0 && { flexGrow: 1 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No messages yet. Send a message to start!</Text>
              </View>
            ) : (
              messages.map((m, index) => (
                <ChatBubble
                  key={m.id}
                  role={m.role}
                  text={m.text}
                  onAnimationComplete={
                    index === messages.length - 1 ? () => setIsAnimating(false) : undefined
                  }
                />
              ))
            )}

            {isLoading && <TypingIndicator />}
          </ScrollView>

          {/* Input Bar */}
          <ChatInput
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            disabled={isLoading || isAnimating}
          />
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
  flex1: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(12),
    paddingBottom: normalize(16),
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#8A8A8E",
  },
});
