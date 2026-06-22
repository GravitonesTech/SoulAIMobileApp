import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BreathingBeginButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const BreathingBeginButton = ({
  onPress,
  disabled = false,
}: BreathingBeginButtonProps) => {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.beginButton, disabled && styles.beginButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <LinearGradient
          colors={["#3C61DD", "#3BC0EB"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.beginButtonText}>Begin Exercise</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: hp(4),
  },
  beginButton: {
    height: moderateScale(56),
    borderRadius: normalize(28),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  beginButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#FFF",
  },
  beginButtonDisabled: {
    opacity: 0.6,
  },
});
