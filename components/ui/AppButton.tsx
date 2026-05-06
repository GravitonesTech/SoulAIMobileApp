import { Typography } from "@/constants/Typography";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

export interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "social";
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  isLoading?: boolean;
}

export const AppButton = ({
  title,
  variant = "primary",
  icon,
  style,
  textStyle,
  onPress,
  isLoading,
  disabled,
  ...props
}: AppButtonProps) => {
  const isSocial = variant === "social";
  const buttonDisabled = disabled || isLoading;

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator color={isSocial ? "#000000" : "#FFFFFF"} />;
    }

    return (
      <>
        {icon &&
          React.cloneElement(icon as React.ReactElement<any>, {
            style: [styles.icon, (icon as React.ReactElement<any>).props.style],
          })}
        <Text
          style={[styles.baseText, isSocial ? styles.socialText : styles.primaryText, textStyle]}
        >
          {title}
        </Text>
      </>
    );
  };

  if (variant === "primary") {
    return (
      <TouchableOpacity
        {...props}
        style={[styles.baseButton, style]}
        activeOpacity={0.8}
        onPress={onPress}
        disabled={buttonDisabled}
      >
        <LinearGradient
          colors={["#3C61DD", "#3BC0EB"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      {...props}
      style={[styles.baseButton, isSocial ? styles.socialButton : styles.primaryButton, style]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={buttonDisabled}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    height: 52,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  primaryButton: {
    backgroundColor: "#3C61DD",
  },
  socialButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
  },
  icon: {
    position: "absolute",
    left: 24, // Put icon on the left edge as shown in Apple/Google buttons
  },
  baseText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  socialText: {
    color: "#000000",
  },
});
