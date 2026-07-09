import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Typography } from "@/constants/Typography";
import { hp, normalize } from "@/utils/responsive";
import { Therapist } from "@/types/therapist";
import { TherapistListItem } from "./TherapistListItem";
import { ErrorView } from "@/components/ui/ErrorView";

interface TopTherapistsListProps {
  therapists: Therapist[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onTherapistPress: (therapist: Therapist) => void;
}

export const TopTherapistsList = ({
  therapists,
  isLoading,
  error,
  onRetry,
  onTherapistPress,
}: TopTherapistsListProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>TOP THERAPISTS</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3C61DD" />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={onRetry} />
      ) : therapists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No therapists found</Text>
        </View>
      ) : (
        therapists.map((therapist) => (
          <TherapistListItem
            key={therapist.id}
            therapist={therapist}
            onPress={() => onTherapistPress(therapist)}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(3),
  },
  sectionLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#666",
    marginBottom: hp(1.5),
    letterSpacing: 0.5,
  },
  loadingContainer: {
    paddingVertical: hp(4),
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    paddingVertical: hp(4),
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#E53935",
    textAlign: "center",
  },
  retryButton: {
    marginTop: hp(1.5),
    backgroundColor: "#3C61DD",
    paddingVertical: hp(1),
    paddingHorizontal: hp(2.5),
    borderRadius: normalize(8),
  },
  retryText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#FFF",
  },
  emptyContainer: {
    paddingVertical: hp(4),
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#666",
    textAlign: "center",
  },
});
