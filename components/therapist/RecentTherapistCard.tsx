import { UserInitialsAvatar } from "@/components/ui/UserInitialsAvatar";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RecentTherapistCardProps {
  therapistName?: string;
  therapistPhoto?: string | null;
  specialization?: string[];
  rating?: number;
  onPress?: () => void;
  isEmpty?: boolean;
}

export const RecentTherapistCard = ({
  therapistName = "",
  therapistPhoto = null,
  specialization = [],
  rating,
  onPress = () => {},
  isEmpty = false,
}: RecentTherapistCardProps) => {
  if (isEmpty) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>RATE RECENT SESSION</Text>
        <View style={styles.recentEmptyCard}>
          <Text style={styles.emptyText}>No recent bookings found.</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.section} onPress={onPress} activeOpacity={0.9}>
      <Text style={styles.sectionLabel}>RATE RECENT SESSION</Text>
      <View style={styles.recentCard}>
        <View style={styles.recentHeader}>
          <View style={{ flex: 1, paddingRight: moderateScale(10) }}>
            <Text style={styles.therapistName} numberOfLines={1}>
              {therapistName}
            </Text>
            {rating !== undefined && (
              <Text style={styles.ratingText}>{rating.toFixed(1)} Rating</Text>
            )}
            <Text style={styles.specializationText} numberOfLines={2}>
              {specialization && specialization.length > 0
                ? `Specialized in ${specialization.join(", ")}`
                : "General Practitioner"}
            </Text>
          </View>
          <Feather name="chevron-right" size={normalize(24)} color="#A0A0A0" />
        </View>
        {therapistPhoto ? (
          <Image source={{ uri: therapistPhoto }} style={styles.recentImage} />
        ) : (
          <View style={styles.recentImagePlaceholder}>
            <UserInitialsAvatar name={therapistName} textSize={normalize(48)} />
          </View>
        )}
      </View>
    </TouchableOpacity>
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
  recentCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp(2),
  },
  therapistName: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#000",
  },
  ratingText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#666",
    marginTop: hp(0.3),
  },
  specializationText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#999",
    marginTop: hp(0.5),
  },
  recentImage: {
    width: "100%",
    height: hp(35),
    borderRadius: normalize(12),
    resizeMode: "cover",
  },
  recentImagePlaceholder: {
    width: "100%",
    height: hp(35),
    borderRadius: normalize(12),
    overflow: "hidden",
  },
  recentEmptyCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#666",
    textAlign: "center",
  },
});
