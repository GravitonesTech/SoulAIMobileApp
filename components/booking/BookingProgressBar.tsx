import { Typography } from "@/constants/Typography";
import { hp, normalize, wp } from "@/utils/responsive";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BookingProgressBarProps {
  currentStep: 1 | 2;
}

export const BookingProgressBar: React.FC<BookingProgressBarProps> = ({ currentStep }) => {
  return (
    <View style={styles.container}>
      {/* Circles and Connecting Line Row */}
      <View style={styles.progressRow}>
        <View style={[styles.stepOuterCircle, styles.stepOuterActive]}>
          <View style={[styles.stepInnerDot, styles.stepInnerActive]} />
        </View>

        <View
          style={[styles.progressLine, currentStep === 2 ? styles.lineActive : styles.lineInactive]}
        />

        <View
          style={[
            styles.stepOuterCircle,
            currentStep === 2 ? styles.stepOuterActive : styles.stepOuterInactive,
          ]}
        >
          <View
            style={[
              styles.stepInnerDot,
              currentStep === 2 ? styles.stepInnerActive : styles.stepInnerInactive,
            ]}
          />
        </View>
      </View>

      {/* Labels Row */}
      <View style={styles.labelsRow}>
        <Text style={[styles.stepLabel, styles.stepLabelActive]}>Personal Info</Text>
        <Text
          style={[
            styles.stepLabel,
            currentStep === 2 ? styles.stepLabelActive : styles.stepLabelInactive,
          ]}
        >
          Payment
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hp(2),
    width: "100%",
    paddingHorizontal: wp(10),
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  stepOuterCircle: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  stepOuterActive: {
    borderColor: "#3C61DD",
  },
  stepOuterInactive: {
    borderColor: "#D1D1D6",
  },
  stepInnerDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
  },
  stepInnerActive: {
    backgroundColor: "#3C61DD",
  },
  stepInnerInactive: {
    backgroundColor: "transparent",
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#E5E5EA",
    marginHorizontal: wp(2),
  },
  lineActive: {
    backgroundColor: "#3C61DD",
  },
  lineInactive: {
    backgroundColor: "#E5E5EA",
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(1),
    width: "100%",
  },
  stepLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#3C61DD",
  },
  stepLabelInactive: {
    color: "#8E8E93",
  },
});
