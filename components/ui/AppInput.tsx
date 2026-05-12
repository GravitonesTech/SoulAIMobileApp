import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import React from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

export interface AppInputProps extends Omit<TextInputProps, "style"> {
  iconName?: keyof typeof Feather.glyphMap;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const AppInput = ({ iconName, rightIcon, style, inputStyle, ...props }: AppInputProps) => {
  return (
    <View style={[styles.container, style]}>
      {iconName && (
        <Feather name={iconName} size={normalize(20)} color="#555555" style={styles.icon} />
      )}
      <TextInput style={[styles.input, inputStyle]} placeholderTextColor="#8A8A8E" {...props} />
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(12),
    paddingVertical: 0, // Using fixed height instead of vertical padding to ensure centering
    height: normalize(52),
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.65)",
    borderRadius: normalize(8),
    width: "100%",
  },
  icon: {
    marginRight: normalize(10),
  },
  input: {
    flex: 1,
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
    color: "#333333",
    height: "100%",
  },
  rightIcon: {
    marginLeft: normalize(10),
  },
});
