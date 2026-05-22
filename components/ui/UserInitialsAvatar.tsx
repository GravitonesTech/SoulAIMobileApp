import { USER_AVATAR_COLORS } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import React, { useMemo } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface UserInitialsAvatarProps {
  name: string;
  style?: ViewStyle;
  textSize?: number;
}

export const UserInitialsAvatar: React.FC<UserInitialsAvatarProps> = ({
  name,
  style,
  textSize = normalize(40),
}) => {
  const { initials, backgroundColor } = useMemo(() => {
    const nameParts = name.trim().split(" ");
    let init = "";
    if (nameParts.length > 0 && nameParts[0].length > 0) {
      init += nameParts[0][0].toUpperCase();
    }
    if (!init) {
      init = "?";
    }

    const firstChar = name.trim().length > 0 ? name.trim().charCodeAt(0) : 0;
    const colorIndex = firstChar % USER_AVATAR_COLORS.length;

    return {
      initials: init,
      backgroundColor: USER_AVATAR_COLORS[colorIndex],
    };
  }, [name]);

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Text style={[styles.initialsText, { fontSize: textSize, lineHeight: textSize * 1.2 }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    borderRadius: normalize(16),
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontFamily: Typography.fonts.bold,
    color: "#FFFFFF",
    textAlign: "center",
    textAlignVertical: "center",
  },
});
