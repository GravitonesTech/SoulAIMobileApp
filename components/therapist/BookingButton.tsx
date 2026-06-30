import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface BookingButtonProps {
  text?: string;
  onPress?: () => void;
}

export const BookingButton = ({ text = "Book Session", onPress }: BookingButtonProps) => {
  return (
    <TouchableOpacity style={styles.floatingButton} activeOpacity={0.85} onPress={onPress}>
      <Feather name="plus-circle" size={normalize(20)} color="#FFF" style={styles.buttonIcon} />
      <Text style={styles.floatingButtonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: hp(4),
    right: wp(5),
    backgroundColor: "#3C61DD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(20),
    borderRadius: normalize(30),
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: moderateScale(8),
  },
  buttonIcon: {
    marginRight: moderateScale(2),
  },
  floatingButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#FFF",
  },
});
