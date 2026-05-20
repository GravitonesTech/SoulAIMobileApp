import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  PAST_THERAPY_SESSIONS,
  PERSONALITY_RESULTS,
  SAVED_PAYMENT_METHODS,
} from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { useAppConfirmation } from "@/hooks/useAppConfirmation";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import { apiClient } from "@/utils/api";
import { AuthService } from "@/utils/auth";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { imageUri, pickImage } = useImagePicker();
  const [isUploading, setIsUploading] = useState(false);
  const { showConfirmation } = useAppConfirmation();
  const user = useAppSelector((state) => state.auth.user);
  const [assessmentStatus, setAssessmentStatus] = useState<{
    phq9Submitted: boolean;
    gad7Submitted: boolean;
  }>({ phq9Submitted: false, gad7Submitted: false });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchStatus = async () => {
        try {
          const response = await apiClient.get<
            Array<{
              form_code: string;
              submitted: boolean;
            }>
          >(ENDPOINTS.users.assessmentStatus);

          if (response.success && response.data && isMounted) {
            const phq9 = response.data.find((f) => f.form_code === "PHQ-9");
            const gad7 = response.data.find((f) => f.form_code === "GAD-7");
            setAssessmentStatus({
              phq9Submitted: !!phq9?.submitted,
              gad7Submitted: !!gad7?.submitted,
            });
          }
        } catch (error) {
          console.error("[ProfileScreen] Error fetching assessment status:", error);
        } finally {
          if (isMounted) {
            setIsLoadingStatus(false);
          }
        }
      };

      fetchStatus();
      return () => {
        isMounted = false;
      };
    }, []),
  );

  const handleUpdateProfilePhoto = async (base64: string) => {
    setIsUploading(true);
    try {
      const response = await apiClient.patch(ENDPOINTS.users.me, {
        profile_photo: `data:image/jpeg;base64,${base64}`,
      });

      if (response.success && response.data) {
        toast.success("Success", "Profile photo updated successfully!");
        dispatch(updateUser(response.data));
      } else {
        console.error("[ProfileScreen] API Error updating photo:", response.message, response);
        toast.error("Update Failed", response.message || "Failed to update profile photo");
      }
    } catch (error) {
      console.error("[ProfileScreen] Error uploading photo:", error);
      toast.error("Error", "A network error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickImage = () => {
    pickImage((data) => {
      if (data.base64) {
        handleUpdateProfilePhoto(data.base64);
      }
    });
  };

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
      <AppHeader
        leftIcon="arrow-left"
        title={user?.full_name || "Profile"}
        rightContent={
          <TouchableOpacity onPress={handleLogout}>
            <MaterialCommunityIcons name="logout-variant" size={normalize(24)} color="#000" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Therapy Info - Now distinct from the image card */}
        <View style={styles.therapyInfo}>
          <Text style={styles.sessionsText}>24 Human Therapy Sessions</Text>
          <Text style={styles.therapySubtext}>Getting Started with Therapy</Text>
        </View>

        {/* Profile Image Card */}
        <View style={styles.imageCard}>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : user?.profile_photo
                  ? { uri: user.profile_photo }
                  : require("@/assets/images/therapist.png")
            }
            style={styles.profileImage}
          />
          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#3C61DD" />
            </View>
          )}
        </View>

        <TouchableOpacity onPress={handlePickImage} style={styles.changePhotoButton}>
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
            <Text style={styles.linkText}>
              {isLoadingStatus
                ? "Checking Status..."
                : assessmentStatus.phq9Submitted && assessmentStatus.gad7Submitted
                  ? "Retake Personality Test"
                  : "Take Personality Test"}
            </Text>
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: normalize(16),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
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
