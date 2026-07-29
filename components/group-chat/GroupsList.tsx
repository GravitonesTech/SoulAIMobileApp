import { Typography } from "@/constants/Typography";
import { useAppSelector } from "@/store/hooks";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GroupData } from "./types";

interface GroupsListProps {
  groups: GroupData[];
  isLoading: boolean;
  onCreatePress: () => void;
  onRespondInvite?: (groupId: string, action: "ACCEPT" | "REJECT") => Promise<void>;
}

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  isLoading,
  onCreatePress,
  onRespondInvite,
}) => {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);
  const myEmail = currentUser?.email || "";

  return (
    <View style={styles.groupsContainer}>
      {isLoading && groups.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3C61DD" />
          <Text style={styles.loadingText}>Fetching groups...</Text>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Feather name="message-square" size={normalize(40)} color="#3C61DD" />
          </View>
          <Text style={styles.emptyTitle}>No Group Chats Yet</Text>
          <Text style={styles.emptySubtitle}>
            You haven{"'"}t joined or created any group chats. Get started by creating one!
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onCreatePress} activeOpacity={0.8}>
            <Text style={styles.emptyButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.groupsList}>
          {groups.map((group) => {
            const isReady = group.status === "READY";
            const isJoined = group.my_status === "JOINED";

            return (
              <View key={group.group_id} style={styles.groupCard}>
                <View style={styles.groupCardHeader}>
                  <Text style={styles.groupTitle} numberOfLines={1}>
                    {group.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      isReady ? styles.statusReady : styles.statusWaiting,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isReady ? styles.statusTextReady : styles.statusTextWaiting,
                      ]}
                    >
                      {isReady ? "Ready" : "Waiting"}
                    </Text>
                  </View>
                </View>

                <View style={styles.groupMembersSection}>
                  <Feather name="users" size={normalize(14)} color="#8A8A8E" />
                  <Text style={styles.groupMembersText} numberOfLines={2}>
                    {[...group.members]
                      .sort((a, b) => {
                        if (a === myEmail) return -1;
                        if (b === myEmail) return 1;
                        return 0;
                      })
                      .map((member) =>
                        member === myEmail ? "You" : group.members_names?.[member] || member,
                      )
                      .join(", ")}
                  </Text>
                </View>

                <View style={styles.groupCardFooter}>
                  <View style={styles.myStatusWrapper}>
                    <Text style={styles.myStatusLabel}>Your Status: </Text>
                    <Text
                      style={[
                        styles.myStatusValue,
                        isJoined ? styles.myStatusJoined : styles.myStatusPending,
                      ]}
                    >
                      {group.my_status}
                    </Text>
                  </View>

                  {isReady && isJoined ? (
                    <TouchableOpacity
                      style={styles.chatNowButton}
                      onPress={() => {
                        router.push({
                          pathname: "/group-chat-room",
                          params: {
                            groupId: group.group_id,
                            title: group.title,
                          },
                        } as any);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chatNowButtonText}>Chat</Text>
                      <Feather name="chevron-right" size={normalize(14)} color="#FFFFFF" />
                    </TouchableOpacity>
                  ) : group.my_status?.toUpperCase() === "PENDING" ? (
                    <View style={styles.inviteButtonsContainer}>
                      <TouchableOpacity
                        style={[styles.inviteButton, styles.rejectButton]}
                        onPress={() => onRespondInvite?.(group.group_id, "REJECT")}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.inviteButton, styles.acceptButton]}
                        onPress={() => onRespondInvite?.(group.group_id, "ACCEPT")}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.waitingPlaceholderBadge}>
                      <Feather name="clock" size={normalize(12)} color="#8A8A8E" />
                      <Text style={styles.waitingPlaceholderText}>Waiting</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  groupsContainer: {
    flex: 1,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(8),
  },
  loadingText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#666666",
    marginTop: hp(1.5),
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(6),
    paddingHorizontal: moderateScale(20),
  },
  emptyIconCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: normalize(40),
    backgroundColor: "rgba(60, 97, 221, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2.5),
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
    marginBottom: hp(3.5),
  },
  emptyButton: {
    backgroundColor: "#3C61DD",
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(12),
    borderRadius: normalize(12),
  },
  emptyButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
  groupsList: {
    gap: hp(2),
  },
  groupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    borderColor: "#EAEAEA",
    borderWidth: 1,
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  groupCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.2),
  },
  groupTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#111111",
    flex: 1,
    marginRight: moderateScale(10),
  },
  statusBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: normalize(6),
  },
  statusReady: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
  },
  statusWaiting: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
  },
  statusText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(11),
  },
  statusTextReady: {
    color: "#34C759",
  },
  statusTextWaiting: {
    color: "#FF9500",
  },
  groupMembersSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    marginBottom: hp(1.8),
  },
  groupMembersText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#666666",
    flex: 1,
  },
  groupCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: hp(1.5),
  },
  myStatusWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  myStatusLabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#8A8A8E",
  },
  myStatusValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
  },
  myStatusJoined: {
    color: "#3C61DD",
  },
  myStatusPending: {
    color: "#FF9500",
  },
  chatNowButton: {
    backgroundColor: "#3C61DD",
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: normalize(8),
  },
  chatNowButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(13),
    color: "#FFFFFF",
  },
  waitingPlaceholderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    backgroundColor: "#F2F3F7",
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
    borderRadius: normalize(6),
  },
  waitingPlaceholderText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#8A8A8E",
  },
  inviteButtonsContainer: {
    flexDirection: "row",
    gap: moderateScale(8),
  },
  inviteButton: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(8),
    borderRadius: normalize(8),
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    backgroundColor: "#F2F3F7",
    borderColor: "#EAEAEA",
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: "#3C61DD",
  },
  rejectButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#666666",
  },
  acceptButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#FFFFFF",
  },
});
