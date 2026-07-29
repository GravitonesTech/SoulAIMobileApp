import { ContextMenuModal } from "@/components/conversations/ContextMenuModal";
import { ConversationItem } from "@/components/conversations/ConversationItem";
import { QuickActionsCard } from "@/components/conversations/QuickActionsCard";
import { RenameModal } from "@/components/conversations/RenameModal";
import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { type Conversation } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ConversationSection = "today" | "yesterday" | "older";

export default function ConversationsScreen() {
  const router = useRouter();
  const { initialMessage } = useLocalSearchParams<{ initialMessage: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayConversations, setTodayConversations] = useState<Conversation[]>([]);
  const [yesterdayConversations, setYesterdayConversations] = useState<Conversation[]>([]);
  const [olderConversations, setOlderConversations] = useState<Conversation[]>([]);

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [selectedConversation, setSelectedConversation] = useState<{
    section: ConversationSection;
    item: Conversation;
  } | null>(null);

  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const rowNodesRef = useRef<Record<string, View | null>>({});

  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  const getSectionSetter = (section: ConversationSection) => {
    if (section === "today") return setTodayConversations;
    if (section === "yesterday") return setYesterdayConversations;
    return setOlderConversations;
  };

  const formatTimestamp = (dateStr?: string): string => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";

      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    } catch {
      return "";
    }
  };

  const fetchSessions = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setIsLoading(true);
    try {
      const response = await apiClient.get<any[]>(ENDPOINTS.chat.sessions);
      if (response.success && Array.isArray(response.data)) {
        const now = new Date();
        const todayDate = now.toDateString();

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const yesterdayDate = yesterday.toDateString();

        const todayList: Conversation[] = [];
        const yesterdayList: Conversation[] = [];
        const olderList: Conversation[] = [];

        response.data.forEach((session: any) => {
          let displayTitle = session.title || "New Chat";
          if (session.therapy_type === "breathing_exercise") {
            if (displayTitle !== "Breathing Exercise" && !displayTitle.startsWith("Breathing Exercise")) {
              displayTitle = `Breathing Exercise ${displayTitle}`;
            }
          }

          const mapped: Conversation = {
            id: session.session_id,
            title: displayTitle,
            timestamp: formatTimestamp(session.updated_at || session.created_at),
            subtitle: `${
              session.therapy_type
                ? session.therapy_type.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
                : "Supportive"
            } Therapy`,
            therapyType: session.therapy_type,
          };

          const sessionDate = new Date(session.updated_at || session.created_at);
          if (isNaN(sessionDate.getTime())) {
            todayList.push(mapped);
          } else if (sessionDate.toDateString() === todayDate) {
            todayList.push(mapped);
          } else if (sessionDate.toDateString() === yesterdayDate) {
            yesterdayList.push(mapped);
          } else {
            try {
              const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
              mapped.timestamp = sessionDate.toLocaleDateString(undefined, options);
            } catch {}
            olderList.push(mapped);
          }
        });

        // Add optimistic/temporary initialMessage conversation if present
        if (initialMessage?.trim()) {
          const matched = todayList.find((c) => c.title === initialMessage.trim());
          if (!matched) {
            todayList.unshift({
              id: Date.now().toString(),
              title: initialMessage.trim(),
              timestamp: formatTimestamp(new Date().toISOString()),
              subtitle: "Supportive Therapy",
            });
          }
        }

        setTodayConversations(todayList);
        setYesterdayConversations(yesterdayList);
        setOlderConversations(olderList);
      }
    } catch (error) {
      console.error("[Conversations] Error loading chat sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSessions();
    }, [initialMessage]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions(false);
    setRefreshing(false);
  };

  const onLongPressConversation = (section: ConversationSection, item: Conversation) => {
    const node = rowNodesRef.current[item.id];
    setSelectedConversation({ section, item });

    const showMenuAt = (x: number, y: number, w: number, h: number) => {
      const { width: screenW, height: screenH } = Dimensions.get("window");
      const menuW = moderateScale(240);
      const menuH = moderateScale(82);
      const gap = moderateScale(12);

      const preferredTop = y + h + gap;
      const top =
        preferredTop + menuH > screenH - gap ? Math.max(gap, y - menuH - gap) : preferredTop;

      const preferredLeft = x + w / 2 - menuW / 2;
      const left = Math.min(screenW - gap - menuW, Math.max(gap, preferredLeft));

      setContextMenuAnchor({ top, left });
      setContextMenuVisible(true);
    };

    if (node?.measureInWindow) {
      node.measureInWindow((x, y, w, h) => showMenuAt(x, y, w, h));
    } else {
      // Fallback: center-ish menu.
      const { width: screenW, height: screenH } = Dimensions.get("window");
      setContextMenuAnchor({ top: screenH * 0.35, left: screenW * 0.5 - moderateScale(120) });
      setContextMenuVisible(true);
    }
  };

  const onPressRename = () => {
    if (!selectedConversation) return;
    setRenameValue(selectedConversation.item.title);
    setContextMenuVisible(false);
    setRenameVisible(true);
  };

  const commitRename = async () => {
    if (!selectedConversation) return;
    const nextTitle = renameValue.trim();
    if (!nextTitle) return;

    const setSection = getSectionSetter(selectedConversation.section);
    const sessionId = selectedConversation.item.id;

    setRenameVisible(false);
    setIsRenaming(true);

    try {
      const response = await apiClient.put(ENDPOINTS.chat.sessionDetails(sessionId), {
        title: nextTitle,
      });

      if (response.success) {
        setSection((prev) =>
          prev.map((c) => (c.id === sessionId ? { ...c, title: nextTitle } : c)),
        );
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("[Conversations] Error renaming session:", error);
      toast.error("Error", "Failed to rename conversation.");
    } finally {
      setIsRenaming(false);
      setSelectedConversation(null);
    }
  };

  const onPressDelete = async () => {
    if (!selectedConversation) return;
    const sessionId = selectedConversation.item.id;
    const setSection = getSectionSetter(selectedConversation.section);

    setContextMenuVisible(false);

    setIsDeleting(true);
    try {
      const response = await apiClient.delete(ENDPOINTS.chat.sessionDetails(sessionId));

      if (response.success) {
        setSection((prev) => prev.filter((c) => c.id !== sessionId));
      } else {
        toast.error("Error", response.message || "Failed to delete session.");
      }
    } catch (error) {
      console.error("[Conversations] Error deleting session:", error);
      toast.error("Error", "Failed to delete conversation.");
    } finally {
      setIsDeleting(false);
      setSelectedConversation(null);
    }
  };

  const openConversation = (item: Conversation) => {
    const isBreathing =
      item.therapyType === "breathing_exercise" ||
      item.subtitle.toLowerCase().includes("breathing");
    if (isBreathing) {
      router.push({
        pathname: "/(drawer)/breathing",
        params: {
          sessionId: item.id,
        },
      } as any);
    } else {
      router.push({
        pathname: "/chat",
        params: {
          title: item.title,
          therapy: item.subtitle.split("•")[0]?.trim() || "Cognitive Therapy",
          sessionId: item.id,
        },
      } as any);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Bar */}
        <AppHeader title="Conversations" />

        {/* Global Loading Overlay */}
        {(isRenaming || isDeleting) && (
          <View style={styles.actionLoadingOverlay}>
            <ActivityIndicator size="large" color="#3C61DD" />
          </View>
        )}

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3C61DD" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3C61DD"]}
                tintColor="#3C61DD"
              />
            }
          >
            {/* Quick actions */}
            <QuickActionsCard />

            {todayConversations.length === 0 &&
            yesterdayConversations.length === 0 &&
            olderConversations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather
                  name="message-square"
                  size={normalize(48)}
                  color="#A0A0A0"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start a chat to get guidance and supportive coaching.
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push("/chatstarter")}
                >
                  <Text style={styles.emptyButtonText}>Start a new chat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {todayConversations.length > 0 && (
                  <>
                    <Text style={styles.sectionLabel}>TODAY</Text>
                    <View style={styles.conversationsCard}>
                      {todayConversations.map((item, index) => (
                        <ConversationItem
                          key={item.id}
                          item={item}
                          isLast={index === todayConversations.length - 1}
                          onPress={() => openConversation(item)}
                          onLongPress={() => onLongPressConversation("today", item)}
                          ref={(node) => {
                            rowNodesRef.current[item.id] = node;
                          }}
                        />
                      ))}
                    </View>
                  </>
                )}

                {yesterdayConversations.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>YESTERDAY</Text>
                    <View style={styles.conversationsCard}>
                      {yesterdayConversations.map((item, index) => (
                        <ConversationItem
                          key={item.id}
                          item={item}
                          isLast={index === yesterdayConversations.length - 1}
                          onPress={() => openConversation(item)}
                          onLongPress={() => onLongPressConversation("yesterday", item)}
                          ref={(node) => {
                            rowNodesRef.current[item.id] = node;
                          }}
                        />
                      ))}
                    </View>
                  </>
                )}

                {olderConversations.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>OLDER</Text>
                    <View style={styles.conversationsCard}>
                      {olderConversations.map((item, index) => (
                        <ConversationItem
                          key={item.id}
                          item={item}
                          isLast={index === olderConversations.length - 1}
                          onPress={() => openConversation(item)}
                          onLongPress={() => onLongPressConversation("older", item)}
                          ref={(node) => {
                            rowNodesRef.current[item.id] = node;
                          }}
                        />
                      ))}
                    </View>
                  </>
                )}
              </>
            )}
          </ScrollView>
        )}

        {/* Long-press context menu (Rename / Delete) */}
        <ContextMenuModal
          visible={contextMenuVisible}
          anchor={contextMenuAnchor}
          onClose={closeContextMenu}
          onRename={onPressRename}
          onDelete={onPressDelete}
        />

        {/* Rename modal */}
        <RenameModal
          visible={renameVisible}
          value={renameValue}
          onChangeText={setRenameValue}
          onClose={() => setRenameVisible(false)}
          onSave={commitRename}
        />

        {/* FAB: New Chat */}
        <TouchableOpacity style={styles.fab} onPress={() => router.push("/chatstarter")}>
          <Feather name="plus" size={normalize(24)} color="#FFF" />
          <Text style={styles.fabText}>New chat</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF7FF",
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(15),
  },
  headerTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(20),
    color: "#000",
  },
  avatarContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: normalize(18),
    overflow: "hidden",
    backgroundColor: "#D1E5FF",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(96),
  },
  sectionLabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#8A8A8E",
    marginBottom: hp(1),
    marginTop: hp(2),
    letterSpacing: 1,
  },
  sectionLabelSpacing: {
    marginTop: hp(2.5),
  },

  conversationsCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(15),
    paddingVertical: moderateScale(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  fab: {
    position: "absolute",
    bottom: hp(4),
    right: moderateScale(20),
    backgroundColor: "#3C61DD",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(12),
    borderRadius: normalize(30),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#FFF",
    marginLeft: wp(2),
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(8),
    paddingHorizontal: wp(6),
  },
  emptyIcon: {
    marginBottom: hp(2),
  },
  emptyTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#1C1C1E",
    marginBottom: hp(1),
  },
  emptySubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#8A8A8E",
    textAlign: "center",
    marginBottom: hp(3),
    lineHeight: normalize(20),
  },
  emptyButton: {
    backgroundColor: "#3C61DD",
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(12),
    borderRadius: normalize(25),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyButtonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#FFF",
  },
  actionLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    elevation: 999,
  },
});
