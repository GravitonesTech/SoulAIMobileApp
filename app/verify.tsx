import { AppButton } from "@/components/ui/AppButton";
import { OtpInput } from "@/components/ui/OtpInput";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";

const VALID_OTP = "2528";

export default function VerifyScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    if (otp.length < 4) {
      toast.error("Incomplete OTP", "Please enter the 4-digit OTP.");
      return;
    }
    if (otp !== VALID_OTP) {
      toast.error("Invalid OTP", "The OTP you entered is incorrect. Please try again.");
      return;
    }
    // ✅ OTP correct → proceed
    router.replace("/language");
  };

  return (
    <LinearGradient colors={[Colors.gradient.start, Colors.gradient.end]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.centerContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.titleText}>Verify Account</Text>
              <Text style={styles.subtitleText}>Enter OTP Received{"\n"}on +91 98*****205</Text>
            </View>

            {/* OTP Input Form */}
            <View style={styles.formContainer}>
              <OtpInput length={4} onChange={setOtp} />

              <AppButton title="Verify" style={styles.verifyBtnMargin} onPress={handleVerify} />
            </View>

            {/* Resend Link */}
            <TouchableOpacity activeOpacity={0.7} style={styles.resendContainer}>
              <Text style={styles.resendText}>Resend Verification Code</Text>
            </TouchableOpacity>

            {/* Bottom Re-enter Phone Number Link */}
            <View style={styles.bottomLinkContainer}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
                <Text style={styles.bottomLinkText}>Re-enter Phone Number</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: moderateScale(28),
    paddingTop: moderateScale(48), // Matching the overall padded look of previous screens
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: hp(5),
  },
  titleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(Typography.sizes.title),
    color: "#FFFFFF",
    marginBottom: hp(1),
  },
  subtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(Typography.sizes.subtitle),
    color: "#FFFFFF",
    opacity: 0.6,
    textAlign: "center", // necessary due to \n multiline centering seen in mockup
    marginBottom: hp(5),
  },
  emailLabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#FFFFFF",
    opacity: 0.7,
    marginBottom: hp(2.5),
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: hp(3),
  },
  verifyBtnMargin: {
    marginTop: hp(2.5), // Add gap between OTP boxes and Verify button
  },
  resendContainer: {
    marginTop: hp(1),
  },
  resendText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#FFFFFF",
    opacity: 0.6,
  },
  bottomLinkContainer: {
    marginTop: hp(4),
    alignItems: "center",
  },
  bottomLinkText: {
    fontFamily: Typography.fonts.medium, // Seems slightly bolder in mockup
    fontSize: normalize(16),
    color: "#FFFFFF",
  },
});
