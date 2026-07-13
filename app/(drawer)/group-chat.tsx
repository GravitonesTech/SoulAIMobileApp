import { CreateGroup } from "@/components/group-chat/CreateGroup";
import { GroupsList } from "@/components/group-chat/GroupsList";
import { GroupData } from "@/components/group-chat/types";
import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { useAppSelector } from "@/store/hooks";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupChatScreen() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<"groups" | "create">("groups");

  // Groups list states
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const response = await apiClient.get<GroupData[]>(ENDPOINTS.chat.myGroups);
      if (response.success && response.data) {
        setGroups(response.data);
      } else {
        toast.error("Fetch Failed", response.message || "Failed to fetch groups.");
      }
    } catch (err: any) {
      console.error("Error fetching groups:", err);
      toast.error("Error", "Could not fetch groups.");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleRespondInvite = async (groupId: string, action: "ACCEPT" | "REJECT") => {
    try {
      const url = ENDPOINTS.chat.respondGroupInvite(groupId);
      const response = await apiClient.post<any>(url, { action });
      if (response.success) {
        toast.success("Success", response.message || `Successfully response sent.`);
        fetchGroups();
      } else {
        toast.error("Error", response.message || "Failed to respond to invite.");
      }
    } catch (err: any) {
      console.error("Error responding to invite:", err);
      toast.error("Error", "Something went wrong. Please try again.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (activeTab === "groups") {
        fetchGroups();
      }
    }, [activeTab]),
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#E2F4FF"]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <AppHeader title="Group Chat" leftIcon="menu" showAvatar={true} />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              refreshControl={
                activeTab === "groups" ? (
                  <RefreshControl
                    refreshing={isLoadingGroups}
                    onRefresh={fetchGroups}
                    colors={["#3C61DD"]}
                  />
                ) : undefined
              }
            >
              {/* Tab Selector */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === "groups" && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveTab("groups");
                    Keyboard.dismiss();
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.tabText, activeTab === "groups" && styles.tabTextActive]}>
                    Groups
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, activeTab === "create" && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveTab("create");
                    Keyboard.dismiss();
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.tabText, activeTab === "create" && styles.tabTextActive]}>
                    Create Group
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === "groups" ? (
                <GroupsList
                  groups={groups}
                  isLoading={isLoadingGroups}
                  onCreatePress={() => setActiveTab("create")}
                  onRespondInvite={handleRespondInvite}
                />
              ) : (
                <CreateGroup
                  currentUser={currentUser}
                  onGroupCreated={() => {
                    setActiveTab("groups");
                  }}
                />
              )}
            </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: hp(1.5),
    paddingBottom: hp(4),
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(60, 97, 221, 0.08)",
    padding: moderateScale(4),
    borderRadius: normalize(14),
    marginBottom: hp(3),
  },
  tabButton: {
    flex: 1,
    paddingVertical: moderateScale(10),
    alignItems: "center",
    borderRadius: normalize(10),
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#8A8A8E",
  },
  tabTextActive: {
    fontFamily: Typography.fonts.bold,
    color: "#3C61DD",
  },
});
