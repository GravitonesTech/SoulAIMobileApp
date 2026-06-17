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
  const initials = useMemo(() => {
    const nameParts = name.trim().split(" ");
    let init = "";
    if (nameParts.length > 0 && nameParts[0].length > 0) {
      init += nameParts[0][0].toUpperCase();
    }
    if (!init) {
      init = "?";
    }

    return init;
  }, [name]);

  return (
    <View style={[styles.container, style]}>
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
    backgroundColor: "#3C61DD",
  },
  initialsText: {
    fontFamily: Typography.fonts.bold,
    color: "#FFFFFF",
    textAlign: "center",
    textAlignVertical: "center",
  },
});
