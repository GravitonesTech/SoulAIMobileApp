import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";

export const RecentTherapistCard = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>RECENT</Text>
      <View style={styles.recentCard}>
        <View style={styles.recentHeader}>
          <View>
            <Text style={styles.therapistName}>Dr. John Nolan</Text>
            <Text style={styles.ratingText}>4.1 Rating</Text>
            <Text style={styles.specializationText}>
              Specialized in Cognitive Therapy
            </Text>
          </View>
          <Feather name="chevron-right" size={normalize(24)} color="#A0A0A0" />
        </View>
        <Image
          source={require("@/assets/images/therapist.png")}
          style={styles.recentImage}
        />
      </View>
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
});
