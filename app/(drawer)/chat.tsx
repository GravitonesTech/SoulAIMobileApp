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
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  shouldAnimate?: boolean;
};

export default function ChatScreen() {
  const router = useRouter();
  const { therapy, initialMessage, sessionId, selected_therapy, showNewChatButton } =
    useLocalSearchParams<{
      therapy?: string;
      initialMessage?: string;
      sessionId?: string;
      selected_therapy?: string;
      showNewChatButton?: string;
    }>();

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isKeyboardVisible = useKeyboardVisibility();
  const scrollViewRef = useRef<ScrollView>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchChatHistory = async (id: string) => {
    setIsHistoryLoading(true);
    try {
      const response = await apiClient.get<any>(ENDPOINTS.chat.sessionDetails(id));
      if (response.success && response.data?.history) {
        const history = response.data.history;
        const mappedMessages: ChatMessage[] = [];

        history.forEach((item: any, index: number) => {
          if (item.user_input) {
            mappedMessages.push({
              id: `hist-u-${index}`,
              role: "user",
              text: item.user_input,
              shouldAnimate: false,
            });
          }

          const responseText =
            item.responses?.claude_response ||
            item.responses?.openai_response ||
            item.responses?.groq_response;

          if (responseText) {
            mappedMessages.push({
              id: `hist-a-${index}`,
              role: "assistant",
              text: responseText,
              shouldAnimate: false,
            });
          }
        });

        setMessages(mappedMessages);
      }
    } catch (error) {
      console.error("[Chat] Error fetching chat history:", error);
      toast.error("Error", "Failed to load chat history");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    // Reset all messages and state when the session/path changes to prevent
    // stale animation or loading flags from locking the chat inputs.
    setMessages([]);
    setIsLoading(false);
    setIsHistoryLoading(false);
    setIsAnimating(false);
    setInputText("");

    if (sessionId && isNaN(Number(sessionId)) && !initialMessage) {
      fetchChatHistory(sessionId);
    }

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
      router.setParams({ initialMessage: "" });
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
          session_id: sessionId || "",
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
          shouldAnimate: true,
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

  const handleNewChatPress = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([]);
    setIsLoading(true);
    setIsAnimating(false);
    setInputText("");

    try {
      const response = await apiClient.post(ENDPOINTS.chat.sessions, {
        therapy_type: "supportive",
        title: "New Chat",
      });
      if (response.success && response.data?.session_id) {
        router.setParams({ sessionId: response.data.session_id });
      } else {
        router.setParams({ sessionId: Date.now().toString() });
      }
    } catch (error) {
      console.error("[Chat] Error creating new session:", error);
      router.setParams({ sessionId: Date.now().toString() });
    } finally {
      setIsLoading(false);
    }
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
            title={showNewChatButton !== "true" ? (therapy ? therapy : undefined) : undefined}
            showBadge={showNewChatButton !== "true" ? true : false}
            onNewChatPress={showNewChatButton === "true" ? handleNewChatPress : undefined}
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
            {isHistoryLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3C61DD" />
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No messages yet. Send a message to start!</Text>
              </View>
            ) : (
              messages.map((m, index) => (
                <ChatBubble
                  key={m.id}
                  role={m.role}
                  text={m.text}
                  shouldAnimate={m.shouldAnimate}
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
            disabled={isLoading || isAnimating || isHistoryLoading}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: normalize(40),
  },
});
