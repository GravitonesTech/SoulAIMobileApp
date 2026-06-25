import { Typography } from "@/constants/Typography";
import { Therapist } from "@/types/therapist";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TherapistSummaryCardProps {
  therapist: Therapist;
  selectedSlot: { day: string; slot: string; date?: string } | null;
}

export const getSlotFormattedDate = (dayName: string, slotTime: string, dateStr?: string) => {
  if (dateStr) {
    try {
      const targetDate = new Date(dateStr);
      const monthStr = targetDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      return `${monthStr} at ${slotTime}`;
    } catch (e) {
      // Fallback
    }
  }

  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const now = new Date();
  const currentDayIndex = now.getDay();

  const targetDayIndex = daysOfWeek.indexOf(dayName.toLowerCase());
  if (targetDayIndex === -1) return `${dayName} at ${slotTime}`;

  let diff = targetDayIndex - currentDayIndex;
  if (diff < 0) {
    diff += 7;
  }
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + diff);

  const monthStr = targetDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${monthStr} at ${slotTime}`;
};

export const TherapistSummaryCard: React.FC<TherapistSummaryCardProps> = ({
  therapist,
  selectedSlot,
}) => {
  return (
    <View style={styles.therapistCard}>
      <View style={styles.therapistLeft}>
        <Text style={styles.therapistName}>{therapist.full_name}</Text>
        <Text style={styles.sessionDuration}>30 minutes Session</Text>
      </View>
      {selectedSlot && (
        <View style={styles.therapistRight}>
          <Text style={styles.slotText}>
            {getSlotFormattedDate(selectedSlot.day, selectedSlot.slot, selectedSlot.date)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  therapistCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: hp(3),
  },
  therapistLeft: {
    flex: 1,
  },
  therapistName: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#000",
  },
  sessionDuration: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#666",
    marginTop: hp(0.4),
  },
  therapistRight: {
    alignItems: "flex-end",
    marginLeft: moderateScale(10),
  },
  slotText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#E53935",
    textAlign: "right",
  },
});
