import { ChatInput } from "@/components/chat/ChatInput";
import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility";
import { apiClient } from "@/utils/api";
import { normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
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

  useEffect(() => {
    if (sessionId) {
      setMessages([]);
    }
  }, [sessionId]);

  useEffect(() => {
    if (initialMessage) {
      console.log("Initial message:", initialMessage);
      handleSend(initialMessage);
    }
  }, [initialMessage, sessionId]);

  const handleSend = async (textOverride?: string | any) => {
    const trimmed = typeof textOverride === "string" ? textOverride : inputText.trim();
    if (!trimmed || isLoading || isAnimating) return;

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
      const response = await apiClient.post(ENDPOINTS.chat.send, {
        session_id: "",
        user_input: trimmed,
        selected_model: "claude",
        selected_therapy: selected_therapy?.toLowerCase() || "",
      });

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
      console.error("[Chat] Error sending message:", error);
      toast.error("Error", "A network error occurred. Please try again.");
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
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === "ios" ? "padding" : isKeyboardVisible ? "height" : undefined}
        >
          {/* Header */}
          <AppHeader
            title={therapy ? therapy : undefined}
            showBadge={therapy ? true : false}
            onNewChatPress={!therapy ? () => setMessages([]) : undefined}
            isNewChatDisabled={isAnimating || isLoading}
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

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#3C61DD" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            )}
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

function ChatBubble({
  role,
  text,
  onAnimationComplete,
}: {
  role: "user" | "assistant";
  text: string;
  onAnimationComplete?: () => void;
}) {
  const isUser = role === "user";
  const [displayedText, setDisplayedText] = useState(isUser ? text : "");

  React.useEffect(() => {
    if (isUser) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        if (onAnimationComplete) onAnimationComplete();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isUser, text]);

  if (isUser) {
    return (
      <View style={[styles.bubbleRow, styles.bubbleRowRight]}>
        <LinearGradient
          colors={["#5A7BEF", "#24A0ED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={[styles.bubbleText, styles.userText]}>{text}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleRow, styles.bubbleRowLeft]}>
      <View style={[styles.bubble, styles.assistantBubble]}>
        <Text style={[styles.bubbleText, styles.assistantText]}>{displayedText}</Text>
      </View>
    </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: normalize(20),
    paddingTop: normalize(8),
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  therapyPill: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(18),
    borderWidth: 1,
    borderColor: "rgba(60, 97, 221, 0.55)",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  therapyPillText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#1C1C1E",
  },
  avatarStub: {
    width: normalize(34),
    height: normalize(34),
    borderRadius: normalize(17),
    backgroundColor: "#D1E5FF",
  },
  titleBlock: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(18),
    paddingBottom: normalize(6),
  },
  titleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(22),
    color: "#111111",
  },
  updateText: {
    marginTop: normalize(6),
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#8A8A8E",
  },
  messagesContent: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(12),
    paddingBottom: normalize(16),
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: normalize(10),
  },
  bubbleRowLeft: {
    justifyContent: "flex-start",
  },
  bubbleRowRight: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "86%",
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12),
    borderRadius: normalize(14),
  },
  userBubble: {
    borderTopRightRadius: normalize(6),
  },
  assistantBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: normalize(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  bubbleText: {
    fontSize: normalize(14),
    lineHeight: normalize(22),
  },
  userText: {
    fontFamily: Typography.fonts.medium,
    color: "#FFFFFF",
  },
  assistantText: {
    fontFamily: Typography.fonts.regular,
    color: "#1C1C1E",
  },
  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(10),
    marginVertical: normalize(10),
    opacity: 0.6,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  dateText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#8A8A8E",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
    marginVertical: normalize(10),
    paddingHorizontal: normalize(10),
  },
  loadingText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#8A8A8E",
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
