import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Typography } from "@/constants/Typography";
import { toast } from "@/utils/toast";
import { apiClient } from "@/utils/api";
import { ENDPOINTS } from "@/constants/endpoints";
import { UserData } from "./types";

interface CreateGroupProps {
  currentUser: any;
  onGroupCreated: () => void;
}

export const CreateGroup: React.FC<CreateGroupProps> = ({ currentUser, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<UserData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState<UserData | null>(null);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const handleSearch = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Validation Error", "Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Validation Error", "Please enter a valid email address.");
      return;
    }

    Keyboard.dismiss();
    setIsSearching(true);
    setSearchInitiated(true);
    setSearchedUser(null);

    try {
      const response = await apiClient.get<UserData>(ENDPOINTS.users.searchUser, {
        params: { email: trimmedEmail },
      });

      if (response.success && response.data) {
        setSearchedUser(response.data);
      } else {
        toast.error("Not Found", response.message || "User not found");
      }
    } catch (err: any) {
      console.error("Error searching user:", err);
      toast.error("Error", "An error occurred while searching for the user.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = (user: UserData) => {
    if (selectedMembers.some((m) => m.email === user.email)) {
      toast.error("Already Added", "This user is already in the list.");
      return;
    }
    if (selectedMembers.length >= 1) {
      toast.error("Limit Reached", "Only one member can be added at max.");
      return;
    }
    setSelectedMembers([...selectedMembers, user]);
    setSearchedUser(null);
    setEmail("");
    setSearchInitiated(false);
  };

  const handleRemoveMember = (memberEmail: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.email !== memberEmail));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Validation Error", "Please enter a group name.");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Validation Error", "Please add at least one member to your group.");
      return;
    }
    if (!currentUser?.email) {
      toast.error("Auth Error", "Could not find your user account email.");
      return;
    }

    setIsCreatingGroup(true);
    try {
      const response = await apiClient.post<any>(ENDPOINTS.chat.createGroup, {
        emails: [currentUser.email, selectedMembers[0].email],
        title: groupName.trim(),
      });

      if (response.success) {
        toast.success("Success", response.message || "Group created successfully!");
        setGroupName("");
        setSelectedMembers([]);
        onGroupCreated();
      } else {
        toast.error("Create Failed", response.message || "Failed to create group.");
      }
    } catch (err: any) {
      console.error("Error creating group:", err);
      toast.error("Error", "An unexpected error occurred while creating group.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Group Name</Text>
      <View style={styles.inputContainer}>
        <Feather name="edit-2" size={normalize(18)} color="#A0A0A0" style={styles.inputIcon} />
        <TextInput
          placeholder="Enter group name"
          placeholderTextColor="#A0A0A0"
          style={styles.textInput}
          value={groupName}
          onChangeText={setGroupName}
          autoCorrect={false}
        />
      </View>

      {selectedMembers.length === 0 ? (
        <>
          <Text style={styles.sectionTitle}>Add Member</Text>
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Feather name="mail" size={normalize(18)} color="#A0A0A0" />
              <TextInput
                placeholder="Enter member's email address"
                placeholderTextColor="#A0A0A0"
                style={styles.searchInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {email.length > 0 && (
                <TouchableOpacity onPress={() => setEmail("")}>
                  <Feather name="x" size={normalize(18)} color="#A0A0A0" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
              onPress={handleSearch}
              activeOpacity={0.8}
              disabled={isSearching}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Search Result Box */}
          <View style={styles.resultBox}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3C61DD" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchedUser ? (
              <View style={styles.userCard}>
                <View style={styles.avatarWrapper}>
                  {searchedUser.profile_photo ? (
                    <Image source={{ uri: searchedUser.profile_photo }} style={styles.userAvatar} />
                  ) : (
                    <View style={[styles.userAvatar, styles.initialsAvatar]}>
                      <Text style={styles.initialsText}>
                        {searchedUser.full_name?.charAt(0).toUpperCase() || "U"}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{searchedUser.full_name}</Text>
                  <Text style={styles.userEmail}>{searchedUser.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddMember(searchedUser)}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={normalize(16)} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            ) : searchInitiated ? (
              <Text style={styles.infoText}>No user found with that email.</Text>
            ) : null}
          </View>
        </>
      ) : null}

      {/* Selected Members Section */}
      {selectedMembers.length > 0 && (
        <View style={styles.membersContainer}>
          <Text style={styles.sectionTitle}>Selected Member ({selectedMembers.length})</Text>
          <View style={styles.membersList}>
            {selectedMembers.map((member) => (
              <View key={member.email} style={styles.memberRow}>
                <View style={styles.memberLeft}>
                  <View style={styles.memberAvatarWrapper}>
                    {member.profile_photo ? (
                      <Image source={{ uri: member.profile_photo }} style={styles.memberAvatar} />
                    ) : (
                      <View style={[styles.memberAvatar, styles.initialsAvatar]}>
                        <Text style={styles.memberInitials}>
                          {member.full_name?.charAt(0).toUpperCase() || "U"}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={styles.memberName}>{member.full_name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member.email)}
                  style={styles.removeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="trash-2" size={normalize(18)} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.primaryButton, isCreatingGroup && styles.primaryButtonDisabled]}
        onPress={handleCreateGroup}
        activeOpacity={0.8}
        disabled={isCreatingGroup}
      >
        {isCreatingGroup ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Create Group</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#333333",
    marginBottom: hp(1),
  },
  inputContainer: {
    height: hp(6),
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(12),
    borderWidth: 1.5,
    borderColor: "#EAEAEA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(15),
    marginBottom: hp(2.5),
  },
  inputIcon: {
    marginRight: moderateScale(10),
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: normalize(14),
    fontFamily: Typography.fonts.regular,
    color: "#000",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
    marginBottom: hp(1.5),
  },
  searchBar: {
    flex: 1,
    height: hp(6),
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(12),
    borderWidth: 1.5,
    borderColor: "#EAEAEA",
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
    paddingHorizontal: moderateScale(15),
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: normalize(14),
    fontFamily: Typography.fonts.regular,
    color: "#000",
  },
  searchButton: {
    backgroundColor: "#3C61DD",
    height: hp(6),
    paddingHorizontal: moderateScale(20),
    borderRadius: normalize(12),
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
  resultBox: {
    marginBottom: hp(2.5),
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8),
    paddingVertical: hp(1.5),
  },
  loadingText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#666666",
  },
  infoText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#8A8A8E",
    textAlign: "center",
    paddingVertical: hp(1),
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: moderateScale(12),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  avatarWrapper: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: normalize(20),
    overflow: "hidden",
    marginRight: moderateScale(12),
  },
  userAvatar: {
    width: "100%",
    height: "100%",
  },
  initialsAvatar: {
    backgroundColor: "#E2F4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#3C61DD",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#111111",
  },
  userEmail: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#666666",
    marginTop: hp(0.2),
  },
  addButton: {
    backgroundColor: "#3C61DD",
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: normalize(8),
  },
  addButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#FFFFFF",
  },
  membersContainer: {
    marginBottom: hp(3),
  },
  membersList: {
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: "#EAEAEA",
    padding: moderateScale(8),
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  memberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  memberAvatarWrapper: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: normalize(18),
    overflow: "hidden",
  },
  memberAvatar: {
    width: "100%",
    height: "100%",
  },
  memberInitials: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#3C61DD",
  },
  memberName: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(13),
    color: "#111111",
  },
  memberEmail: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#666666",
    marginTop: hp(0.2),
  },
  removeButton: {
    padding: moderateScale(4),
  },
  primaryButton: {
    backgroundColor: "#3C61DD",
    height: hp(6),
    borderRadius: normalize(12),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginTop: hp(2),
  },
  primaryButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  primaryButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#FFFFFF",
  },
});
