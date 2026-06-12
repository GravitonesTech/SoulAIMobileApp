import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Schedule {
  day_of_week: string;
  time_slots: string[];
}

interface AvailabilitySlotsProps {
  schedules: Schedule[];
  selectedSlot: { day: "today" | "tomorrow"; slot: string } | null;
  onChangeSlot: (slot: { day: "today" | "tomorrow"; slot: string }) => void;
}

const STANDARD_SLOTS = ["10:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"];

export const AvailabilitySlots = ({
  schedules,
  selectedSlot,
  onChangeSlot,
}: AvailabilitySlotsProps) => {
  // Get Today's and Tomorrow's info
  const dateInfo = useMemo(() => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const now = new Date();

    const todayIndex = now.getDay();
    const todayDayName = daysOfWeek[todayIndex];

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowIndex = tomorrow.getDay();
    const tomorrowDayName = daysOfWeek[tomorrowIndex];

    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const tomorrowLabel = `Tomorrow, ${tomorrow.toLocaleDateString("en-US", options)}`;

    return {
      today: { name: todayDayName, label: "Today" },
      tomorrow: { name: tomorrowDayName, label: tomorrowLabel },
    };
  }, []);

  // Helper to map available slots
  const getSlotsForDay = useCallback(
    (dayName: string) => {
      const daySchedule = schedules?.find(
        (s) => s.day_of_week.toLowerCase() === dayName.toLowerCase(),
      );
      const availableSlots = daySchedule?.time_slots || [];

      return STANDARD_SLOTS.map((slot) => {
        const isAvailable = availableSlots.some(
          (as) => as.replace(/\s+/g, "").toLowerCase() === slot.replace(/\s+/g, "").toLowerCase(),
        );
        return {
          time: slot,
          isAvailable,
        };
      });
    },
    [schedules],
  );

  const todaySlots = useMemo(
    () => getSlotsForDay(dateInfo.today.name),
    [getSlotsForDay, dateInfo.today.name],
  );
  const tomorrowSlots = useMemo(
    () => getSlotsForDay(dateInfo.tomorrow.name),
    [getSlotsForDay, dateInfo.tomorrow.name],
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>AVAILABILITY SLOTS</Text>
      <View style={styles.slotsCard}>
        {/* Today */}
        <Text style={styles.daySublabel}>{dateInfo.today.label}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.slotsRow}
        >
          {todaySlots.map((slot, index) => {
            const isSelected = selectedSlot?.day === "today" && selectedSlot?.slot === slot.time;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.slotButton,
                  slot.isAvailable ? styles.slotAvailable : styles.slotUnavailable,
                  isSelected && styles.slotSelected,
                ]}
                onPress={() => {
                  if (slot.isAvailable) {
                    onChangeSlot({ day: "today", slot: slot.time });
                  }
                }}
                disabled={!slot.isAvailable}
              >
                <Text
                  style={[
                    styles.slotTimeText,
                    slot.isAvailable
                      ? styles.slotTimeAvailableText
                      : styles.slotTimeUnavailableText,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot.time}
                </Text>
                <Text
                  style={[
                    styles.slotStatusText,
                    slot.isAvailable
                      ? styles.slotStatusAvailableText
                      : styles.slotStatusUnavailableText,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot.isAvailable ? "Available" : "Unavailable"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tomorrow */}
        <Text style={[styles.daySublabel, { marginTop: hp(2) }]}>{dateInfo.tomorrow.label}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.slotsRow}
        >
          {tomorrowSlots.map((slot, index) => {
            const isSelected = selectedSlot?.day === "tomorrow" && selectedSlot?.slot === slot.time;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.slotButton,
                  slot.isAvailable ? styles.slotAvailable : styles.slotUnavailable,
                  isSelected && styles.slotSelected,
                ]}
                onPress={() => {
                  if (slot.isAvailable) {
                    onChangeSlot({ day: "tomorrow", slot: slot.time });
                  }
                }}
                disabled={!slot.isAvailable}
              >
                <Text
                  style={[
                    styles.slotTimeText,
                    slot.isAvailable
                      ? styles.slotTimeAvailableText
                      : styles.slotTimeUnavailableText,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot.time}
                </Text>
                <Text
                  style={[
                    styles.slotStatusText,
                    slot.isAvailable
                      ? styles.slotStatusAvailableText
                      : styles.slotStatusUnavailableText,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot.isAvailable ? "Available" : "Unavailable"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(3.5),
  },
  sectionLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#666",
    marginBottom: hp(1.5),
    letterSpacing: 0.5,
  },
  slotsCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(14),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  daySublabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(13),
    color: "#333",
    marginBottom: hp(1.2),
    paddingHorizontal: moderateScale(4),
  },
  slotsRow: {
    flexDirection: "row",
    gap: moderateScale(10),
    paddingHorizontal: moderateScale(4),
  },
  slotButton: {
    width: moderateScale(105),
    height: moderateScale(54),
    borderRadius: normalize(8),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  slotAvailable: {
    backgroundColor: "#FFFFFF",
    borderColor: "#3C61DD",
  },
  slotUnavailable: {
    backgroundColor: "#F9FAFC",
    borderColor: "rgba(0,0,0,0.03)",
  },
  slotSelected: {
    backgroundColor: "#3C61DD",
    borderColor: "#3C61DD",
  },
  slotTimeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
  },
  slotTimeAvailableText: {
    color: "#3C61DD",
  },
  slotTimeUnavailableText: {
    color: "#8A8A8E",
  },
  slotStatusText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(10),
    marginTop: hp(0.3),
  },
  slotStatusAvailableText: {
    color: "#3C61DD",
  },
  slotStatusUnavailableText: {
    color: "#8A8A8E",
  },
  slotTextSelected: {
    color: "#FFFFFF",
  },
});
