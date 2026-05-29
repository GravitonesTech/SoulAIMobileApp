import { UserInitialsAvatar } from "./UserInitialsAvatar";
import { useAppSelector } from "@/store/hooks";
import { normalize } from "@/utils/responsive";
import React from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";

interface UserAvatarProps {
  size?: number;
  style?: ViewStyle | ViewStyle[];
}

export const UserAvatar = ({ size = 36, style }: UserAvatarProps) => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <View
      style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}
    >
      {user?.profile_photo ? (
        <Image source={{ uri: user.profile_photo }} style={styles.avatar} />
      ) : (
        <UserInitialsAvatar name={user?.full_name || "User"} textSize={normalize(size * 0.4)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});
