import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

interface BreathingOptionsProps {
  step: number;
  durationOptions: string[];
  patternOptions: string[];
  musicOptions: string[];
  isAnimating: boolean;
  isLoading: boolean;
  onOptionSelect: (option: string) => void;
}

export const BreathingOptions = ({
  step,
  durationOptions,
  patternOptions,
  musicOptions,
  isAnimating,
  isLoading,
  onOptionSelect,
}: BreathingOptionsProps) => {
  let options: string[] = [];
  if (step === 1) options = durationOptions;
  else if (step === 2) options = patternOptions;
  else if (step === 3) options = musicOptions;

  if (step === 4) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.optionsScrollContent}
      style={styles.optionsScroll}
    >
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.optionChip, (isAnimating || isLoading) && styles.optionChipDisabled]}
          onPress={() => onOptionSelect(option)}
          disabled={isAnimating || isLoading}
        >
          <Text
            style={[styles.optionText, (isAnimating || isLoading) && styles.optionTextDisabled]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  optionsScroll: {
    maxHeight: hp(8),
  },
  optionsScrollContent: {
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(10),
    alignItems: "center",
  },
  optionChip: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    borderRadius: normalize(25),
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3C61DD",
  },
  optionText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#3C61DD",
  },
  optionChipDisabled: {
    borderColor: "#A0A0A0",
    opacity: 0.6,
  },
  optionTextDisabled: {
    color: "#A0A0A0",
  },
});
