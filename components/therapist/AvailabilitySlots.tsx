import { Typography } from "@/constants/Typography";
import { AvailabilityDay } from "@/types/therapist";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AvailabilitySlotsProps {
  availability?: AvailabilityDay[];
  selectedSlot: { day: string; slot: string; date?: string } | null;
  onChangeSlot: (slot: { day: string; slot: string; date?: string } | null) => void;
  loading?: boolean;
}

export const AvailabilitySlots = ({
  availability,
  selectedSlot,
  onChangeSlot,
  loading,
}: AvailabilitySlotsProps) => {
  const isTimeSlotInPast = (slotStr: string, dateStr: string) => {
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (dateStr !== localToday) return false;

    const firstTimePart = slotStr.split("-")[0].trim();
    const match = firstTimePart.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
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

    return now > slotTime;
  };

  const sortedAvailability = useMemo(() => {
    if (!availability || availability.length === 0) return [];
    return [...availability].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [availability]);

  const getLabelFromDate = (dateStr: string, dayName: string) => {
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const targetDate = new Date(dateStr);
      targetDate.setHours(0, 0, 0, 0);

      const diffMs = targetDate.getTime() - now.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const month = targetDate.toLocaleDateString("en-US", { month: "short" });
      const dateNum = targetDate.getDate();

      if (diffDays === 0) {
        return "Today";
      } else if (diffDays === 1) {
        return `Tomorrow, ${month} ${dateNum}`;
      } else {
        return `${dayName}, ${month} ${dateNum}`;
      }
    } catch {
      return `${dayName}, ${dateStr}`;
    }
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>AVAILABILITY SLOTS</Text>
        <View
          style={[
            styles.slotsCard,
            { justifyContent: "center", alignItems: "center", paddingVertical: moderateScale(24) },
          ]}
        >
          <ActivityIndicator size="small" color="#3C61DD" />
        </View>
      </View>
    );
  }

  const hasAvailability = sortedAvailability.length > 0;

  if (!hasAvailability) {
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
        {sortedAvailability.map((availDay, dayIndex) => (
          <View key={availDay.date} style={dayIndex > 0 ? { marginTop: hp(2) } : null}>
            <Text style={styles.daySublabel}>
              {getLabelFromDate(availDay.date, availDay.day_of_week)}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.slotsRow}
            >
              {availDay.time_slots.map((slotObj, index) => {
                const isAvailable =
                  slotObj.is_available && !isTimeSlotInPast(slotObj.time, availDay.date);
                const isSelected =
                  selectedSlot?.day.toLowerCase() === availDay.day_of_week.toLowerCase() &&
                  selectedSlot?.slot === slotObj.time &&
                  (!selectedSlot?.date || selectedSlot?.date === availDay.date);

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
                          onChangeSlot({
                            day: availDay.day_of_week,
                            slot: slotObj.time,
                            date: availDay.date,
                          });
                        }
                      }
                    }}
                    disabled={!isAvailable}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.slotTimeText,
                        isAvailable ? styles.slotTimeAvailableText : styles.slotTimeUnavailableText,
                        isSelected && styles.slotTextSelected,
                      ]}
                    >
                      {slotObj.time}
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
        ))}
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
