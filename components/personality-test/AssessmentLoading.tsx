import React from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";

interface AssessmentLoadingProps {
  message?: string;
}

export const AssessmentLoading = ({
  message = "Loading assessments...",
}: AssessmentLoadingProps) => {
  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#3C61DD" />
        <Text style={styles.subtitleText}>{message}</Text>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  subtitleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
    color: "#666666",
    textAlign: "center",
    lineHeight: normalize(22),
    marginTop: 15,
  },
});
