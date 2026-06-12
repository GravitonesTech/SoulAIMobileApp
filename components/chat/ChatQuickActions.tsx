import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

interface ChatQuickActionsProps {
  onSoundHealingPress: () => void;
  onBreathingPress: () => void;
  isSoundHealingLoading?: boolean;
  disabled?: boolean;
}

export const ChatQuickActions = ({
  onSoundHealingPress,
  onBreathingPress,
  isSoundHealingLoading = false,
  disabled = false,
}: ChatQuickActionsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <TouchableOpacity
        style={[styles.button, (disabled || isSoundHealingLoading) && styles.buttonDisabled]}
        onPress={onSoundHealingPress}
        activeOpacity={0.7}
        disabled={disabled || isSoundHealingLoading}
      >
        {isSoundHealingLoading ? (
          <ActivityIndicator size="small" color="#3C61DD" />
        ) : (
          <Text style={styles.buttonText}>Sound Healing</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onBreathingPress}
        activeOpacity={0.7}
        disabled={disabled || isSoundHealingLoading}
      >
        <Text style={styles.buttonText}>Breathing Exercise</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onBreathingPress}
        activeOpacity={0.7}
        disabled={disabled || isSoundHealingLoading}
      >
        <Text style={styles.buttonText}>Breathing Exercise</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onBreathingPress}
        activeOpacity={0.7}
        disabled={disabled || isSoundHealingLoading}
      >
        <Text style={styles.buttonText}>Breathing Exercise</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: normalize(52),
    marginBottom: normalize(8),
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(12),
    paddingHorizontal: normalize(16),
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2FD", // Soft matching background
    borderWidth: 1.2,
    borderColor: "#3C61DD", // Border brand blue
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(20),
    minHeight: normalize(42),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#3C61DD",
    textAlign: "center",
  },
});
