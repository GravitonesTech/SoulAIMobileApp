import { UserInitialsAvatar } from "@/components/ui/UserInitialsAvatar";
import { Typography } from "@/constants/Typography";
import { Therapist } from "@/types/therapist";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather, FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TherapistListItemProps {
  therapist: Therapist;
  onPress: () => void;
}

export const TherapistListItem = ({ therapist, onPress }: TherapistListItemProps) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(
          <FontAwesome
            key={i}
            name="star"
            size={normalize(14)}
            color="#FFC107"
            style={styles.starIcon}
          />,
        );
      } else if (rating >= i - 0.5) {
        stars.push(
          <FontAwesome
            key={i}
            name="star-half-o"
            size={normalize(14)}
            color="#FFC107"
            style={styles.starIcon}
          />,
        );
      } else {
        stars.push(
          <FontAwesome
            key={i}
            name="star-o"
            size={normalize(14)}
            color="#E0E0E0"
            style={styles.starIcon}
          />,
        );
      }
    }
    return stars;
  };

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
          <View style={styles.ratingRow}>
            {therapist.total_reviews > 0 ? (
              <>
                <View style={styles.starsContainer}>{renderStars(therapist.average_rating)}</View>
                <Text style={styles.reviewsCountText}>
                  {`(${therapist.total_reviews} reviews)`}
                </Text>
              </>
            ) : (
              <Text style={styles.noRatingsText}>No ratings yet</Text>
            )}
          </View>
          <Text style={styles.specializationText} numberOfLines={2}>
            {therapist.specialization && therapist.specialization.length > 0
              ? `Specialized in ${therapist.specialization.join(", ")}`
              : "General Practitioner"}
          </Text>
          <View style={styles.costBadge}>
            <Feather name="tag" size={normalize(12)} color="#3C61DD" style={styles.costIcon} />
            <Text style={styles.costText}>{`Rs. ${therapist.session_cost ?? 100} / session`}</Text>
          </View>
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.3),
  },
  starIcon: {
    marginRight: moderateScale(4),
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: moderateScale(2),
  },
  reviewsCountText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#666",
  },
  noRatingsText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#999",
  },
  specializationText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#999",
    marginTop: hp(0.5),
  },
  costBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2F4FF",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: normalize(6),
    alignSelf: "flex-start",
    marginTop: hp(0.8),
  },
  costIcon: {
    marginRight: moderateScale(4),
  },
  costText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#3C61DD",
  },
});
