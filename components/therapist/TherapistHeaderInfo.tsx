import { UserInitialsAvatar } from "@/components/ui/UserInitialsAvatar";
import { Typography } from "@/constants/Typography";
import { Therapist } from "@/types/therapist";
import { hp, normalize } from "@/utils/responsive";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface TherapistHeaderInfoProps {
  therapist: Therapist;
  hideSpecialization?: boolean;
}

export const TherapistHeaderInfo = ({
  therapist,
  hideSpecialization = false,
}: TherapistHeaderInfoProps) => {
  return (
    <View style={styles.container}>
      {/* Rating and Experience Summary */}
      <View style={styles.summaryBlock}>
        <Text style={styles.summaryText}>
          {therapist.total_reviews > 0
            ? `${therapist.average_rating.toFixed(1)} Rating`
            : "No ratings yet"}{" "}
          • {therapist.experience_years}+ years experience
        </Text>
        {!hideSpecialization && (
          <Text style={styles.specializationText}>
            {therapist.specialization && therapist.specialization.length > 0
              ? `Specialized in ${therapist.specialization.join(", ")}`
              : "General Practitioner"}
          </Text>
        )}
      </View>

      {/* Large Therapist Image */}
      <View style={styles.imageCard}>
        {therapist.profile_photo ? (
          <Image source={{ uri: therapist.profile_photo }} style={styles.profileImage} />
        ) : (
          <UserInitialsAvatar name={therapist.full_name} textSize={normalize(60)} />
        )}
      </View>

      {/* Bio */}
      <View style={styles.bioContainer}>
        <Text style={styles.bioText}>
          {therapist.bio ||
            `${therapist.full_name} is a licensed therapist dedicated to helping you navigate life's challenges with clarity and compassion.`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  summaryBlock: {
    marginTop: hp(1.5),
    marginBottom: hp(2),
  },
  summaryText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#666",
    letterSpacing: 0.2,
  },
  specializationText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(15),
    color: "#999",
    marginTop: hp(0.5),
  },
  imageCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: hp(2.5),
    aspectRatio: 1.1,
    alignSelf: "center",
    width: "100%",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    alignSelf: "center",
  },
  bioContainer: {
    marginBottom: hp(3),
  },
  bioText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    lineHeight: normalize(22),
    color: "#555",
  },
});
