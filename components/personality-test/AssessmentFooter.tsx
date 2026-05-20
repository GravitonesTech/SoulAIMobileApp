import { Typography } from "@/constants/Typography";
import { hp, normalize } from "@/utils/responsive";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const AssessmentFooter = () => {
  return (
    <View style={styles.whoFooter}>
      <View style={styles.whoDivider} />
      <Text style={styles.whoFooterText}>
        Assessment questions are based on standardized clinical scales (PHQ-9 and GAD-7) as
        recommended by the{"\n"}
        <Text style={styles.whoHighlight}>WORLD HEALTH ORGANIZATION</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  whoFooter: {
    marginTop: hp(1),
    alignItems: "center",
  },
  whoDivider: {
    width: "40%",
    height: normalize(1),
    backgroundColor: "rgba(60, 97, 221, 0.15)",
    marginBottom: hp(2),
  },
  whoFooterText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#8E8E8E",
    textAlign: "center",
    lineHeight: normalize(18),
    opacity: 0.8,
  },
  whoHighlight: {
    fontFamily: Typography.fonts.medium,
    color: "#3C61DD",
    fontSize: normalize(10),
  },
});
