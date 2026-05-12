import {
  PAST_THERAPY_SESSIONS,
  PERSONALITY_RESULTS,
  SAVED_PAYMENT_METHODS,
} from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { useAppConfirmation } from "@/hooks/useAppConfirmation";
import { useImagePicker } from "@/hooks/useImagePicker";
import { AuthService } from "@/utils/auth";
import { moderateScale, normalize, hp } from "@/utils/responsive";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { imageUri, pickImage } = useImagePicker();
  const { showConfirmation } = useAppConfirmation();

  const personalityResults = PERSONALITY_RESULTS;
  const paymentMethods = SAVED_PAYMENT_METHODS;
  const pastSessions = PAST_THERAPY_SESSIONS;

  const handleLogout = () => {
    showConfirmation(
      "Logout",
      "Are you sure you want to logout?",
      async () => {
        await AuthService.logout();
      },
      {
        confirmLabel: "Logout",
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Feather name="arrow-left" size={normalize(24)} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arjun Chakraborty</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout-variant" size={normalize(24)} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Therapy Info - Now distinct from the image card */}
        <View style={styles.therapyInfo}>
          <Text style={styles.sessionsText}>24 Human Therapy Sessions</Text>
          <Text style={styles.therapySubtext}>Getting Started with Therapy</Text>
        </View>

        {/* Profile Image Card */}
        <View style={styles.imageCard}>
          <Image
            source={imageUri ? { uri: imageUri } : require("@/assets/images/therapist.png")}
            style={styles.profileImage}
          />
        </View>

        <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </TouchableOpacity>

        {/* Personality Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONALITY RESULTS</Text>
          <View style={styles.card}>
            {personalityResults.map((result, index) => (
              <View
                key={index}
                style={[
                  styles.cardItem,
                  index === personalityResults.length - 1 && styles.noBorder,
                ]}
              >
                <Text style={styles.cardItemText}>{result}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/personality-test")}
          >
            <Text style={styles.linkText}>Retake Personality Test</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SAVED PAYMENT METHODS</Text>
          <View style={styles.card}>
            {paymentMethods.map((method, index) => (
              <View
                key={method.id}
                style={[styles.paymentItem, index === paymentMethods.length - 1 && styles.noBorder]}
              >
                <View>
                  <Text style={styles.paymentType}>{method.type}</Text>
                  <Text style={styles.paymentDetails}>Ends in ****-{method.last4}</Text>
                </View>
                <TouchableOpacity>
                  <Feather name="trash-2" size={normalize(22)} color="#464646" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addPaymentButton}>
            <Text style={styles.addPaymentText}>+ Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Past Therapy Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAST THERAPY SESSIONS</Text>
          <View style={styles.card}>
            {pastSessions.map((session, index) => (
              <View
                key={session.id}
                style={[styles.sessionItem, index === pastSessions.length - 1 && styles.noBorder]}
              >
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDoctor}>{session.doctor}</Text>
                  <Text style={styles.sessionAmount}>- Rs. {session.amount}</Text>
                </View>
                <Text style={styles.sessionDetails}>
                  {session.date} • {session.duration}
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.seeMoreText}>see more</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f9ff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(15),
  },
  headerButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(20),
    color: "#000",
  },
  scrollContent: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(40),
  },
  therapyInfo: {
    marginTop: hp(1),
    marginBottom: hp(2.5),
    paddingHorizontal: moderateScale(4),
  },
  sessionsText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#464646",
  },
  therapySubtext: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(15),
    color: "#8E8E8E",
    marginTop: hp(0.5),
  },
  imageCard: {
    backgroundColor: "#FFF",
    width: "100%",
    aspectRatio: 1,
    borderRadius: normalize(16),
    padding: moderateScale(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 1,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: normalize(16),
    resizeMode: "cover",
  },
  changePhotoButton: {
    alignSelf: "flex-end",
    marginBottom: hp(2.5),
    marginTop: hp(0.5),
  },
  changePhotoText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#3C61DD",
    textAlign: "right",
  },
  section: {
    marginBottom: hp(3.7),
  },
  sectionTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#464646",
    marginBottom: hp(1.5),
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: normalize(15),
    overflow: "hidden",
    marginBottom: hp(1.5),
  },
  cardItem: {
    paddingVertical: moderateScale(18),
    paddingHorizontal: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardItemText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(15),
    color: "#000",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  linkButton: {
    alignSelf: "flex-end",
  },
  linkText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#3C61DD",
    textAlign: "right",
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: moderateScale(15),
    paddingHorizontal: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  paymentType: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#000",
  },
  paymentDetails: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#8E8E8E",
    marginTop: hp(0.25),
  },
  addPaymentButton: {
    alignSelf: "flex-end",
    marginTop: hp(-0.5),
  },
  addPaymentText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#3C61DD",
  },
  sessionItem: {
    paddingVertical: moderateScale(15),
    paddingHorizontal: moderateScale(18),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  sessionDoctor: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#000",
  },
  sessionAmount: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#D32F2F",
  },
  sessionDetails: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#8E8E8E",
  },
  seeMoreText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#3C61DD",
    textAlign: "right",
  },
});
