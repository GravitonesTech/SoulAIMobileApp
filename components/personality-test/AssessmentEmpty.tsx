import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Typography } from "@/constants/Typography";
import { AppButton } from "@/components/ui/AppButton";
import { normalize } from "@/utils/responsive";

interface AssessmentEmptyProps {
  onBack: () => void;
}

export const AssessmentEmpty = ({ onBack }: AssessmentEmptyProps) => {
  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
        ]}
      >
        <Text style={styles.titleText}>No Assessments Available</Text>
        <Text style={styles.subtitleText}>Please check back later.</Text>
        <AppButton title="Go Back" onPress={onBack} />
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
  titleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(26),
    color: "#111111",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: normalize(34),
  },
  subtitleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
    color: "#666666",
    textAlign: "center",
    lineHeight: normalize(22),
    marginBottom: 20,
  },
});
