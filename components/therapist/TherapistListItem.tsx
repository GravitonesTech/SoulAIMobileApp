import { UserInitialsAvatar } from "@/components/ui/UserInitialsAvatar";
import { Typography } from "@/constants/Typography";
import { Therapist } from "@/types/therapist";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TherapistListItemProps {
  therapist: Therapist;
  onPress: () => void;
}

export const TherapistListItem = ({ therapist, onPress }: TherapistListItemProps) => {
  return (
    <TouchableOpacity style={styles.therapistListItem} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.therapistListLeft}>
        <View style={styles.listAvatarContainer}>
          {therapist.profile_photo ? (
            <Image source={{ uri: therapist.profile_photo }} style={styles.avatar} />
          ) : (
            <UserInitialsAvatar name={therapist.full_name} textSize={normalize(18)} />
          )}
        </View>
        <View style={styles.listInfo}>
          <Text style={styles.therapistName}>{therapist.full_name}</Text>
          <Text style={styles.ratingText}>
            {therapist.total_reviews > 0
              ? `${therapist.average_rating.toFixed(1)} Rating (${therapist.total_reviews} reviews)`
              : "No ratings yet"}
          </Text>
          <Text style={styles.specializationText} numberOfLines={2}>
            {therapist.specialization && therapist.specialization.length > 0
              ? `Specialized in ${therapist.specialization.join(", ")}`
              : "General Practitioner"}
          </Text>
        </View>
      </View>
      <Feather name="chevron-right" size={normalize(24)} color="#A0A0A0" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  therapistListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(12),
    marginBottom: hp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  therapistListLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(15),
  },
  listAvatarContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: normalize(25),
    backgroundColor: "#D1E5FF",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  listInfo: {
    flex: 1,
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
});
