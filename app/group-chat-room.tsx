import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { AppHeader } from "@/components/ui/AppHeader";
import { Typography } from "@/constants/Typography";
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility";
import { useAppSelector } from "@/store/hooks";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { storage } from "@/utils/storage";
import { toast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface GroupMessage {
  id: string;
  sender_email: string;
  sender_name: string;
  text: string;
  created_at: string;
  is_me: boolean;
  event_type?:
    | "CHAT_MESSAGE"
    | "SESSION_STATE_CHANGED"
    | "USER_DISCONNECTED"
    | "USER_CONNECTED"
    | "WAITING_FOR_USERS";
  state?: string;
}

export default function GroupChatRoomScreen() {
  const router = useRouter();
  const { groupId, title } = useLocalSearchParams<{ groupId: string; title: string }>();
  const currentUser = useAppSelector((state) => state.auth.user);
  const myEmail = currentUser?.email || "";
  const isKeyboardVisible = useKeyboardVisibility();

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiTypingMessage, setAiTypingMessage] = useState("");

  const scrollViewRef = useRef<ScrollView>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef(0);

  const connectWebSocket = useCallback(async () => {
    if (!groupId) return;

    let token = "";
    try {
      token = (await storage.getAccessToken()) || "";
    } catch (e) {
      console.warn("[GroupChatRoom] Could not retrieve access token for WS connection:", e);
    }

    // Connect to WebSocket with token query parameter for authentication
    const wsUrl = `wss://soulai.in/chat/ws/group-chat/${groupId}?token=${token}&access_token=${token}`;
    console.log("[GroupChatRoom] Connecting to WS:", wsUrl);

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[GroupChatRoom] WebSocket connected");
      reconnectAttemptsRef.current = 0;
      setIsLoadingHistory(false);
    };

    ws.onmessage = (event) => {
      console.log("[GroupChatRoom] WS Message received:", event.data);
      try {
        const data = JSON.parse(event.data);
        const payload = data.data || data;

        const eventType = payload.event_type || "CHAT_MESSAGE";

        if (eventType === "SESSION_STATE_CHANGED") {
          const state = payload.state || "";
          const msgText = payload.message || payload.content || "";

          setIsAiTyping(false);

          if (msgText) {
            const newMsg: GroupMessage = {
              id: `state-${Date.now()}-${Math.random()}`,
              sender_email: "system",
              sender_name: "System",
              text: msgText,
              created_at: new Date().toISOString(),
              is_me: false,
              event_type: "SESSION_STATE_CHANGED",
              state: state,
            };

            setMessages((prev) => {
              // Prevent duplicate system messages
              const isDuplicate = prev.some(
                (m) => m.text === newMsg.text && m.event_type === "SESSION_STATE_CHANGED",
              );
              if (isDuplicate) {
                return prev;
              }
              return [...prev, newMsg];
            });

            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
          return;
        }

        if (eventType === "WAITING_FOR_USERS") {
          return;
        }

        if (eventType === "AI_TYPING") {
          const msgText =
            payload.message || payload.content || "AI is analyzing and typing a response...";
          setIsAiTyping(true);
          setAiTypingMessage(msgText);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
          return;
        }

        if (eventType === "USER_DISCONNECTED" || eventType === "USER_CONNECTED") {
          const msgText = payload.message || payload.content || "";

          if (msgText) {
            const newMsg: GroupMessage = {
              id: `system-${Date.now()}-${Math.random()}`,
              sender_email: "system",
              sender_name: "System",
              text: msgText,
              created_at: new Date().toISOString(),
              is_me: false,
              event_type: eventType,
            };

            setMessages((prev) => {
              // Prevent duplicate system messages
              const isDuplicate = prev.some(
                (m) => m.text === newMsg.text && m.event_type === eventType,
              );
              if (isDuplicate) {
                return prev;
              }
              return [...prev, newMsg];
            });

            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
          return;
        }

        const sender = payload.sender || payload.sender_email || payload.email || "";
        const text = payload.content || payload.message || payload.text || payload.user_input || "";

        setIsAiTyping(false);

        if (text) {
          const name =
            payload.sender_name ||
            payload.full_name ||
            payload.name ||
            (sender.includes("@") ? sender.split("@")[0] : sender) ||
            "User";
          const createdAt = payload.created_at || new Date().toISOString();
          const messageId =
            payload.id?.toString() ||
            payload.message_id?.toString() ||
            `msg-${Date.now()}-${Math.random()}`;

          const newMsg: GroupMessage = {
            id: messageId,
            sender_email: sender,
            sender_name: name,
            text: text,
            created_at: createdAt,
            is_me: sender.toLowerCase() === myEmail.toLowerCase(),
            event_type: "CHAT_MESSAGE",
          };

          setMessages((prev) => {
            // Prevent duplicate messages
            const isDuplicate = prev.some(
              (m) =>
                m.id === newMsg.id ||
                (m.text === newMsg.text &&
                  m.sender_email === newMsg.sender_email &&
                  Math.abs(
                    new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime(),
                  ) < 2000),
            );
            if (isDuplicate) {
              return prev;
            }

            // Remove corresponding optimistic message if it exists
            const filtered = prev.filter(
              (m) =>
                !(
                  m.id.startsWith("temp-") &&
                  m.text === newMsg.text &&
                  m.sender_email === newMsg.sender_email
                ),
            );
            return [...filtered, newMsg];
          });

          // Auto scroll to end on new message
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } catch (err) {
        console.error("[GroupChatRoom] Error parsing WS message payload:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[GroupChatRoom] WebSocket error occurred:", err);
    };

    ws.onclose = (event) => {
      console.log("[GroupChatRoom] WebSocket closed:", event.code, event.reason);

      // Auto-reconnect with exponential backoff if not closed intentionally
      if (wsRef.current === ws && reconnectAttemptsRef.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        console.log(`[GroupChatRoom] Reconnecting WebSocket in ${delay}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connectWebSocket();
        }, delay);
      }
    };
  }, [groupId, myEmail, currentUser]);

  useFocusEffect(
    useCallback(() => {
      setIsLoadingHistory(true);
      connectWebSocket();

      return () => {
        console.log("[GroupChatRoom] Cleaning up WebSocket connection");
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    }, [groupId, connectWebSocket]),
  );

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !groupId || isSending) return;

    setIsSending(true);
    setInputText("");
    setIsAiTyping(false);

    // Optimistically add user's message to the list
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: GroupMessage = {
      id: tempId,
      sender_email: myEmail,
      sender_name: currentUser?.full_name || myEmail.split("@")[0] || "Me",
      text: trimmed,
      created_at: new Date().toISOString(),
      is_me: true,
      event_type: "CHAT_MESSAGE",
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    // Scroll to end immediately after rendering optimistic message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const payload = {
          message: trimmed,
          text: trimmed,
          content: trimmed,
          user_input: trimmed,
          sender: myEmail,
          sender_email: myEmail,
        };
        wsRef.current.send(JSON.stringify(payload));
        console.log("[GroupChatRoom] Message sent via WebSocket successfully");
      } catch (e) {
        console.error("[GroupChatRoom] WS send failed:", e);
        toast.error("Error", "Failed to send message over connection.");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setIsSending(false);
      }
    } else {
      toast.error("Offline", "Connection is not ready. Trying to reconnect...");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setIsSending(false);
      connectWebSocket();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await connectWebSocket();
    setIsRefreshing(false);
  };

  const renderMessage = (m: GroupMessage) => {
    if (m.event_type === "SESSION_STATE_CHANGED") {
      return (
        <View key={m.id} style={styles.systemMessageContainer}>
          <View style={styles.systemMessagePill}>
            <View
              style={[
                styles.statusDot,
                m.state === "READY" ? styles.statusDotReady : styles.statusDotPending,
              ]}
            />
            <Text style={styles.systemMessageText}>{m.text}</Text>
          </View>
        </View>
      );
    }

    if (m.event_type === "WAITING_FOR_USERS") {
      return (
        <View key={m.id} style={styles.systemMessageContainer}>
          <View style={styles.systemMessagePill}>
            <ActivityIndicator
              size="small"
              color="#FF9500"
              style={{ marginRight: normalize(6), transform: [{ scale: 0.75 }] }}
            />
            <Text style={styles.systemMessageText}>{m.text}</Text>
          </View>
        </View>
      );
    }

    if (m.event_type === "USER_DISCONNECTED" || m.event_type === "USER_CONNECTED") {
      const isDisconnected = m.event_type === "USER_DISCONNECTED";
      return (
        <View key={m.id} style={styles.systemMessageContainer}>
          <View style={styles.systemMessagePill}>
            <Feather
              name={isDisconnected ? "user-x" : "user-check"}
              size={normalize(12)}
              color={isDisconnected ? "#FF3B30" : "#34C759"}
              style={{ marginRight: normalize(6) }}
            />
            <Text style={styles.systemMessageText}>{m.text}</Text>
          </View>
        </View>
      );
    }

    const isMe = m.is_me;
    const isAI = m.sender_email.toLowerCase() === "ai";
    const displayName = isAI ? "Soul AI" : m.sender_name;

    return (
      <View key={m.id} style={styles.messageGroup}>
        <ChatBubble
          role={isMe ? "user" : "assistant"}
          text={m.text}
          shouldAnimate={false}
          senderName={!isMe ? displayName : undefined}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#E2F4FF"]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
          <AppHeader
            title={title || "Group Chat"}
            leftIcon="arrow-left"
            onLeftPress={() => router.back()}
          />

          <KeyboardAvoidingView
            style={styles.flex1}
            behavior={Platform.OS === "ios" ? "padding" : isKeyboardVisible ? "height" : undefined}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.flex1}
              contentContainerStyle={[
                styles.scrollContent,
                messages.length === 0 && styles.centerContent,
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={["#3C61DD"]}
                />
              }
            >
              {isLoadingHistory && messages.length === 0 ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#3C61DD" />
                  <Text style={styles.loaderText}>Loading conversation...</Text>
                </View>
              ) : messages.length === 0 && !isAiTyping ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Feather name="message-square" size={normalize(32)} color="#3C61DD" />
                  </View>
                  <Text style={styles.emptyTitle}>Welcome to Group Chat!</Text>
                  <Text style={styles.emptySubtitle}>
                    Send a message to start conversing with your group members.
                  </Text>
                </View>
              ) : (
                <>
                  {messages.map(renderMessage)}
                  {isAiTyping && (
                    <View style={styles.typingWrapper}>
                      <View style={styles.typingHeader}>
                        <Text style={styles.typingHeaderText}>Soul AI</Text>
                      </View>
                      <TypingIndicator />
                      <Text style={styles.typingStatusText}>{aiTypingMessage}</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <ChatInput
              value={inputText}
              onChangeText={setInputText}
              onSend={handleSend}
              placeholder="Type your message..."
              disabled={isSending}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(12),
    paddingBottom: normalize(16),
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#666666",
    marginTop: hp(1.5),
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(20),
  },
  emptyIconCircle: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: normalize(32),
    backgroundColor: "rgba(60, 97, 221, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2),
  },
  emptyTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#111111",
    marginBottom: hp(1),
  },
  emptySubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#666666",
    textAlign: "center",
    lineHeight: normalize(20),
  },
  systemMessageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: normalize(12),
    width: "100%",
  },
  systemMessagePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
  },
  statusDot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    marginRight: normalize(6),
  },
  statusDotReady: {
    backgroundColor: "#34C759",
  },
  statusDotPending: {
    backgroundColor: "#FF9500",
  },
  systemMessageText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(11),
    color: "#6e6e73",
  },
  messageGroup: {
    width: "100%",
    marginBottom: normalize(2),
  },
  typingWrapper: {
    marginLeft: normalize(12),
    marginBottom: normalize(10),
  },
  typingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(4),
  },
  typingHeaderText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#3C61DD",
  },
  typingStatusText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#8e8e93",
    marginLeft: normalize(12),
    marginTop: normalize(-4),
    marginBottom: normalize(10),
  },
});
