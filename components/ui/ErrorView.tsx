import React from "react";
import { StyleSheet, Text, View, StyleProp, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppButton } from "@/components/ui/AppButton";
import { Typography } from "@/constants/Typography";
import { normalize, moderateScale, hp } from "@/utils/responsive";

export interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
  isFullPage?: boolean;
}

export function ErrorView({
  message = "An unexpected network error occurred",
  onRetry,
  style,
  isFullPage = false,
}: ErrorViewProps) {
  return (
    <View style={[styles.container, isFullPage ? styles.fullPage : styles.card, style]}>
      <View style={styles.iconContainer}>
        <Feather name="alert-triangle" size={normalize(32)} color="#FF3B30" />
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <AppButton
          title="Try Again"
          onPress={onRetry}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: moderateScale(24),
  },
  fullPage: {
    flex: 1,
    height: "100%",
  },
  card: {
    backgroundColor: "rgba(255, 59, 48, 0.05)",
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.1)",
    marginVertical: hp(2),
  },
  iconContainer: {
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(30),
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2),
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#000000",
    marginBottom: hp(1),
    textAlign: "center",
  },
  message: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#666666",
    textAlign: "center",
    lineHeight: normalize(20),
    marginBottom: hp(3),
    paddingHorizontal: moderateScale(10),
  },
  button: {
    minWidth: normalize(140),
    maxWidth: normalize(200),
    height: normalize(44),
    paddingVertical: 0,
  },
});
