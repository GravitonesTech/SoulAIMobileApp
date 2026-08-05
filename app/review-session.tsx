import { UserInitialsAvatar } from "@/components/ui/UserInitialsAvatar";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    therapistId: string;
    therapistName: string;
    therapistSpecialization?: string;
    therapistPhoto?: string;
    bookingId?: string;
  }>();

  const therapistId = params.therapistId || "";
  const therapistName = params.therapistName || "your Therapist";
  const therapistSpecialization = params.therapistSpecialization || "";
  const therapistPhoto = params.therapistPhoto || "";
  const bookingId = params.bookingId || "";

  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSkip = () => {
    router.replace("/(drawer)/human-therapists");
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Rating Required", "Please select at least 1 star to submit.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        therapist_id: Number(therapistId),
        rating: rating,
        review_text: reviewText.trim(),
      };

      if (bookingId) {
        payload.appointment_id = Number(bookingId);
      }

      const response = await apiClient.post(ENDPOINTS.users.addReview, payload);

      if (response.success) {
        toast.success("Review Submitted", "Thank you for sharing your feedback!");
        router.replace("/(drawer)/human-therapists");
      } else {
        toast.error("Submission Failed", response.message || "Failed to submit your review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error", "Could not connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Skip Button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Session Feedback</Text>
          <TouchableOpacity onPress={handleSkip} disabled={isSubmitting} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Sparkles / Celebration Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient colors={["#E2F4FF", "#FFFFFF"]} style={styles.celebrationCircle}>
                <Feather name="check-circle" size={normalize(48)} color="#3C61DD" />
              </LinearGradient>
            </View>

            {/* Title / Question */}
            <Text style={styles.title}>Hope that felt good!</Text>
            <Text style={styles.subtitle}>
              How was your session with your therapist? Please take a moment to rate and review your
              experience.
            </Text>

            {/* Therapist Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                {therapistPhoto ? (
                  <Image source={{ uri: therapistPhoto }} style={styles.avatar} />
                ) : (
                  <UserInitialsAvatar name={therapistName} textSize={normalize(18)} />
                )}
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.therapistName}>{therapistName}</Text>
                {therapistSpecialization ? (
                  <Text style={styles.specialization}>{therapistSpecialization}</Text>
                ) : (
                  <Text style={styles.specialization}>Human Therapist</Text>
                )}
              </View>
            </View>

            {/* Rating Stars Selector */}
            <Text style={styles.sectionLabel}>TAP TO RATE</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => handleStarPress(index)}
                  style={styles.starWrapper}
                  disabled={isSubmitting}
                >
                  <FontAwesome
                    name={rating >= index ? "star" : "star-o"}
                    size={normalize(38)}
                    color={rating >= index ? "#FFC107" : "#D0D7DE"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Written Review Input Box */}
            <Text style={styles.sectionLabel}>WRITE A REVIEW (OPTIONAL)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
                placeholder="Share your thoughts or thank your therapist..."
                placeholderTextColor="#A0A0A0"
                value={reviewText}
                onChangeText={setReviewText}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
              <Text style={styles.charCounter}>{reviewText.length}/500</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtnWrapper}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#3C61DD", "#5D85F3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Review</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Alternate skip link at bottom */}
            <TouchableOpacity style={styles.skipLink} onPress={handleSkip} disabled={isSubmitting}>
              <Text style={styles.skipLinkText}>Maybe Later</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(5),
    height: hp(7),
  },
  headerTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#111111",
  },
  skipButton: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
  },
  skipText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#666666",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(6),
    alignItems: "center",
  },
  iconContainer: {
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  celebrationCircle: {
    width: normalize(90),
    height: normalize(90),
    borderRadius: normalize(45),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(24),
    color: "#111111",
    marginBottom: hp(1.2),
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#666666",
    textAlign: "center",
    lineHeight: normalize(20),
    marginBottom: hp(3.5),
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(16),
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: hp(3),
    borderWidth: 1,
    borderColor: "rgba(60, 97, 221, 0.08)",
  },
  avatarContainer: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    overflow: "hidden",
    marginRight: wp(4),
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  profileDetails: {
    flex: 1,
  },
  therapistName: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#111111",
  },
  specialization: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#888888",
    marginTop: hp(0.3),
  },
  sectionLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(11),
    color: "#64748B",
    letterSpacing: 1,
    marginBottom: hp(1.5),
    alignSelf: "flex-start",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp(3),
    marginBottom: hp(4),
    width: "100%",
  },
  starWrapper: {
    padding: moderateScale(4),
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: normalize(16),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    marginBottom: hp(4),
  },
  textInput: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#111111",
    height: hp(12),
    padding: 0,
  },
  charCounter: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#94A3B8",
    alignSelf: "flex-end",
    marginTop: hp(0.5),
  },
  submitBtnWrapper: {
    width: "100%",
    borderRadius: normalize(16),
    overflow: "hidden",
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  submitBtn: {
    width: "100%",
    paddingVertical: hp(1.8),
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#FFFFFF",
  },
  skipLink: {
    paddingVertical: hp(2),
    marginTop: hp(1),
  },
  skipLinkText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#3C61DD",
  },
});
