import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Typography } from "@/constants/Typography";
import { Option } from "@/types/assessment";
import { moderateScale, normalize, wp, hp } from "@/utils/responsive";

interface OptionCardProps {
  option: Option;
  isSelected: boolean;
  onSelect: (value: number) => void;
}

export const OptionCard = ({ option, isSelected, onSelect }: OptionCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onSelect(option.id)}
      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
    >
      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
        {option.option_text}
      </Text>
      <Text style={[styles.optionValue, isSelected && styles.optionValueSelected]}>
        {option.score_weight}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: moderateScale(64),
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(12),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: normalize(4),
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: "#3C61DD",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  optionLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(17),
    color: "#464646",
    flex: 1,
  },
  optionLabelSelected: {
    color: "#3C61DD",
  },
  optionValue: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(17),
    color: "#8E8E8E",
    marginLeft: wp(3),
  },
  optionValueSelected: {
    color: "#3C61DD",
  },
});
