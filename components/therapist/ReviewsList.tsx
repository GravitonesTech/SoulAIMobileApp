import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { UserInitialsAvatar } from "@/components/ui/UserInitialsAvatar";

interface Review {
  author: string;
  time: string;
  rating: number;
  content: string;
  photo: string | null;
}

interface ReviewsListProps {
  reviews: Review[];
}

export const ReviewsList = ({ reviews }: ReviewsListProps) => {
  return (
    <View style={styles.reviewsList}>
      {reviews.map((rev, index) => (
        <View key={index} style={styles.reviewItem}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewAvatarContainer}>
              {rev.photo ? (
                <Image source={{ uri: rev.photo }} style={styles.reviewAvatar} />
              ) : (
                <UserInitialsAvatar name={rev.author} textSize={normalize(16)} />
              )}
            </View>
            <View style={styles.reviewMeta}>
              <Text style={styles.reviewAuthor}>{rev.author}</Text>
              <Text style={styles.reviewTime}>
                {rev.time} • <Text style={styles.reviewRatingHighlight}>{rev.rating} Rating</Text>
              </Text>
            </View>
          </View>
          <Text style={styles.reviewContent}>{rev.content}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  reviewsList: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: hp(2),
    gap: hp(2),
  },
  reviewItem: {
    backgroundColor: "transparent",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
    marginBottom: hp(1),
  },
  reviewAvatarContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: normalize(18),
    backgroundColor: "#D1E5FF",
    overflow: "hidden",
  },
  reviewAvatar: {
    width: "100%",
    height: "100%",
  },
  reviewMeta: {
    flex: 1,
  },
  reviewAuthor: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(13),
    color: "#000",
  },
  reviewTime: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#8A8A8E",
    marginTop: hp(0.2),
  },
  reviewRatingHighlight: {
    fontFamily: Typography.fonts.medium,
    color: "#3C61DD",
  },
  reviewContent: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    lineHeight: normalize(18),
    color: "#333",
    paddingLeft: moderateScale(48),
  },
});
