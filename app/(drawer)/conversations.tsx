import {
  CONVERSATIONS_QUICK_ACTIONS,
  TODAY_CONVERSATIONS_SEED,
  YESTERDAY_CONVERSATIONS_SEED,
  type Conversation,
} from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { moderateScale, normalize, hp, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ConversationSection = "today" | "yesterday";

export default function ConversationsScreen() {
  const router = useRouter();
  const { initialMessage } = useLocalSearchParams<{ initialMessage: string }>();

  const navigation = useNavigation<any>();

  const onPressMenu = () => {
    navigation.openDrawer();
  };

  const initialToday = useMemo<Conversation[]>(() => {
    if (!initialMessage?.trim()) return TODAY_CONVERSATIONS_SEED;
    const next = [...TODAY_CONVERSATIONS_SEED];
    if (next[0]) next[0] = { ...next[0], title: initialMessage.trim() };
    return next;
  }, [initialMessage]);

  const initialYesterday = useMemo<Conversation[]>(() => YESTERDAY_CONVERSATIONS_SEED, []);

  const [todayConversations, setTodayConversations] = useState<Conversation[]>(initialToday);
  const [yesterdayConversations, setYesterdayConversations] =
    useState<Conversation[]>(initialYesterday);

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

  const rowNodesRef = useRef<Record<string, View | null>>({});

  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  const getSectionSetter = (section: ConversationSection) => {
    return section === "today" ? setTodayConversations : setYesterdayConversations;
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

  const commitRename = () => {
    if (!selectedConversation) return;
    const nextTitle = renameValue.trim();
    if (!nextTitle) return;

    const setSection = getSectionSetter(selectedConversation.section);
    setSection((prev) =>
      prev.map((c) => (c.id === selectedConversation.item.id ? { ...c, title: nextTitle } : c)),
    );

    setRenameVisible(false);
    setSelectedConversation(null);
  };

  const onPressDelete = () => {
    if (!selectedConversation) return;
    const setSection = getSectionSetter(selectedConversation.section);
    setSection((prev) => prev.filter((c) => c.id !== selectedConversation.item.id));
    setContextMenuVisible(false);
    setSelectedConversation(null);
  };

  const quickActions = CONVERSATIONS_QUICK_ACTIONS;

  const openConversation = (item: Conversation) => {
    router.push({
      pathname: "/chat",
      params: {
        title: item.title,
        therapy: item.subtitle.split("•")[0]?.trim() || "Cognitive Therapy",
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onPressMenu}>
            <Feather name="menu" size={normalize(26)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conversations</Text>
          <TouchableOpacity onPress={() => {}}>
            <View style={styles.avatarContainer}>
              <Image source={require("@/assets/images/avatar.png")} style={styles.avatar} />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick actions */}
          <View style={styles.quickActionsCard}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionRow,
                  index === quickActions.length - 1 && styles.noBorder,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.quickActionLeft}>
                  <Feather name={action.icon as any} size={normalize(18)} color={action.color} />
                  <Text
                    style={[styles.quickActionText, action.id === "sos" && styles.sosActionText]}
                  >
                    {action.label}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={normalize(18)}
                  color={action.id === "sos" ? "#FF3B30" : "#C7C7CC"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>TODAY</Text>
          <View style={styles.conversationsCard}>
            {todayConversations.map((item, index) => (
              <View
                key={item.id}
                ref={(node) => {
                  rowNodesRef.current[item.id] = node;
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.conversationItem,
                    index === todayConversations.length - 1 && styles.noBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => openConversation(item)}
                  onLongPress={() => onLongPressConversation("today", item)}
                  delayLongPress={250}
                >
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemTime}>{item.timestamp}</Text>
                    </View>
                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>YESTERDAY</Text>
          <View style={styles.conversationsCard}>
            {yesterdayConversations.map((item, index) => (
              <View
                key={item.id}
                ref={(node) => {
                  rowNodesRef.current[item.id] = node;
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.conversationItem,
                    index === yesterdayConversations.length - 1 && styles.noBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => openConversation(item)}
                  onLongPress={() => onLongPressConversation("yesterday", item)}
                  delayLongPress={250}
                >
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemTime}>{item.timestamp}</Text>
                    </View>
                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Long-press context menu (Rename / Delete) */}
        <Modal
          transparent
          visible={contextMenuVisible}
          animationType="fade"
          onRequestClose={closeContextMenu}
        >
          <Pressable style={styles.menuBackdrop} onPress={closeContextMenu}>
            <View style={styles.menuLayer} pointerEvents="box-none">
              <Pressable
                style={[
                  styles.contextMenu,
                  { top: contextMenuAnchor.top, left: contextMenuAnchor.left },
                ]}
                onPress={() => {}}
              >
                <TouchableOpacity
                  style={styles.menuAction}
                  activeOpacity={0.7}
                  onPress={onPressRename}
                >
                  <Feather name="edit-2" size={normalize(18)} color="#1C1C1E" />
                  <Text style={styles.menuActionText}>Rename</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuAction}
                  activeOpacity={0.7}
                  onPress={onPressDelete}
                >
                  <Feather name="trash-2" size={normalize(18)} color="#1C1C1E" />
                  <Text style={styles.menuActionText}>Delete</Text>
                </TouchableOpacity>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Rename modal */}
        <Modal
          transparent
          visible={renameVisible}
          animationType="fade"
          onRequestClose={() => setRenameVisible(false)}
        >
          <Pressable style={styles.menuBackdrop} onPress={() => setRenameVisible(false)}>
            <Pressable style={styles.renameCard} onPress={() => {}}>
              <Text style={styles.renameTitle}>Rename conversation</Text>
              <TextInput
                value={renameValue}
                onChangeText={setRenameValue}
                placeholder="Enter a new name"
                placeholderTextColor="#A0A0A0"
                style={styles.renameInput}
                autoFocus
              />
              <View style={styles.renameButtons}>
                <TouchableOpacity
                  style={[styles.renameBtn, styles.renameBtnSecondary]}
                  activeOpacity={0.7}
                  onPress={() => setRenameVisible(false)}
                >
                  <Text style={[styles.renameBtnText, styles.renameBtnTextSecondary]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.renameBtn, styles.renameBtnPrimary]}
                  activeOpacity={0.7}
                  onPress={commitRename}
                >
                  <Text style={styles.renameBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

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
  quickActionsCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(15),
    marginBottom: hp(1.7),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  quickActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
    borderBottomWidth: 0.5,
    borderBottomColor: "#F2F2F2",
  },
  quickActionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  quickActionText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#1C1C1E",
  },
  sosActionText: {
    color: "#FF3B30",
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
  conversationItem: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(15),
    borderBottomWidth: 0.5,
    borderBottomColor: "#F2F2F2",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  itemTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#000",
  },
  itemTime: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#8A8A8E",
  },
  itemSubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#8A8A8E",
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

  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  menuLayer: {
    flex: 1,
  },
  contextMenu: {
    position: "absolute",
    width: moderateScale(240),
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: moderateScale(14),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  menuAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
  },
  menuActionText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#1C1C1E",
  },
  menuDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.06)",
  },

  renameCard: {
    marginHorizontal: wp(5.3),
    marginTop: hp(27),
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  renameTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#111111",
    marginBottom: hp(1),
  },
  renameInput: {
    height: moderateScale(46),
    borderRadius: normalize(12),
    paddingHorizontal: moderateScale(12),
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#111111",
  },
  renameButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: moderateScale(8),
    marginTop: hp(1.7),
  },
  renameBtn: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
    borderRadius: normalize(12),
    minWidth: moderateScale(90),
    alignItems: "center",
  },
  renameBtnPrimary: {
    backgroundColor: "#3C61DD",
  },
  renameBtnSecondary: {
    backgroundColor: "rgba(60, 97, 221, 0.08)",
  },
  renameBtnText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
  renameBtnTextSecondary: {
    color: "#3C61DD",
  },
});
