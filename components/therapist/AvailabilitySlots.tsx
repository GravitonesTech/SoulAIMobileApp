import { AVAILABLE_TIMES } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Schedule {
  day_of_week: string;
  time_slots: string[];
}

interface AvailabilitySlotsProps {
  schedules: Schedule[];
  selectedSlot: { day: string; slot: string } | null;
  onChangeSlot: (slot: { day: string; slot: string } | null) => void;
}

export const AvailabilitySlots = ({
  schedules,
  selectedSlot,
  onChangeSlot,
}: AvailabilitySlotsProps) => {
  const isTimeSlotInPast = (slotStr: string) => {
    const match = slotStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return false;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hours < 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }

    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return new Date() > slotTime;
  };

  const getDayOffset = (dayName: string) => {
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
    if (targetDayIndex === -1) return 999;

    let diff = targetDayIndex - currentDayIndex;
    if (diff < 0) {
      diff += 7;
    }

    // If day name matches today, check if all slots have already passed
    if (diff === 0) {
      const daySchedule = schedules?.find(
        (s) => s.day_of_week.toLowerCase() === dayName.toLowerCase(),
      );
      const timeSlots = daySchedule?.time_slots || [];
      if (timeSlots.length > 0 && timeSlots.every(isTimeSlotInPast)) {
        diff = 7; // Shift to next week
      }
    }

    return diff;
  };

  const getDayLabel = (dayName: string) => {
    const diff = getDayOffset(dayName);
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);

    const month = targetDate.toLocaleDateString("en-US", { month: "short" });
    const dateNum = targetDate.getDate();

    if (diff === 0) {
      return "Today";
    } else if (diff === 1) {
      return `Tomorrow, ${month} ${dateNum}`;
    } else {
      return `${dayName}, ${month} ${dateNum}`;
    }
  };

  const sortedSchedules = useMemo(() => {
    if (!schedules) return [];
    return [...schedules].sort((a, b) => getDayOffset(a.day_of_week) - getDayOffset(b.day_of_week));
  }, [schedules]);

  if (!schedules || schedules.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>AVAILABILITY SLOTS</Text>
        <View style={styles.slotsCard}>
          <Text style={styles.noSlotsText}>No availability schedules listed.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>AVAILABILITY SLOTS</Text>
      <View style={styles.slotsCard}>
        {sortedSchedules.map((schedule, dayIndex) => {
          const diff = getDayOffset(schedule.day_of_week);

          return (
            <View key={schedule.day_of_week} style={dayIndex > 0 ? { marginTop: hp(2) } : null}>
              <Text style={styles.daySublabel}>{getDayLabel(schedule.day_of_week)}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.slotsRow}
              >
                {AVAILABLE_TIMES.map((slot, index) => {
                  const normalizeTimeStr = (str: string) => {
                    return str
                      .replace(/\s+/g, "")
                      .toLowerCase()
                      .replace(/(?:^|[^0-9])0([0-9]:)/g, "$1");
                  };

                  const isSlotScheduled = schedule.time_slots.some(
                    (as) => normalizeTimeStr(as) === normalizeTimeStr(slot)
                  );
                  // Slot is available if it is scheduled AND (not today or not in the past today)
                  const isPast = diff === 0 && isTimeSlotInPast(slot);
                  const isAvailable = isSlotScheduled && !isPast;

                  const isSelected =
                    selectedSlot?.day.toLowerCase() === schedule.day_of_week.toLowerCase() &&
                    selectedSlot?.slot === slot;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.slotButton,
                        isAvailable ? styles.slotAvailable : styles.slotUnavailable,
                        isSelected && styles.slotSelected,
                      ]}
                      onPress={() => {
                        if (isAvailable) {
                          if (isSelected) {
                            onChangeSlot(null);
                          } else {
                            onChangeSlot({ day: schedule.day_of_week, slot });
                          }
                        }
                      }}
                      disabled={!isAvailable}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.slotTimeText,
                          isAvailable
                            ? styles.slotTimeAvailableText
                            : styles.slotTimeUnavailableText,
                          isSelected && styles.slotTextSelected,
                        ]}
                      >
                        {slot}
                      </Text>
                      <Text
                        style={[
                          styles.slotStatusText,
                          isAvailable
                            ? styles.slotStatusAvailableText
                            : styles.slotStatusUnavailableText,
                          isSelected && styles.slotTextSelected,
                        ]}
                      >
                        {isAvailable ? "Available" : "Unavailable"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}
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
    height: moderateScale(56),
    borderRadius: normalize(14),
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: hp(0.2),
  },
  slotAvailable: {
    backgroundColor: "#FFFFFF",
    borderColor: "#3C61DD",
  },
  slotUnavailable: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E5EA",
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
    color: "#5B7BE9",
    opacity: 0.7,
  },
  slotStatusText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
  },
  slotStatusAvailableText: {
    color: "#333333",
  },
  slotStatusUnavailableText: {
    color: "#666666",
  },
  slotTextSelected: {
    color: "#FFFFFF",
  },
  noSlotsText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#8A8A8E",
    paddingHorizontal: moderateScale(4),
    paddingVertical: moderateScale(4),
  },
});
