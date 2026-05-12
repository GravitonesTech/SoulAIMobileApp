import { AppButton } from "@/components/ui/AppButton";
import { OtpInput } from "@/components/ui/OtpInput";
import { ENDPOINTS } from "@/constants/endpoints";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { apiClient } from "@/utils/api";
import { toast } from "@/utils/toast";
import { useResendOtpCooldown } from "@/hooks/useResendOtpCooldown";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { hp, moderateScale, normalize } from "@/utils/responsive";

export default function EmailVerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resolvedEmail = typeof email === "string" ? email : email?.[0] || "";

  const {
    resend,
    resendLabel,
    isDisabled: isResendDisabled,
  } = useResendOtpCooldown({
    email: resolvedEmail,
    baseLabel: "Resend Verification Code",
    disabled: isLoading,
  });

  const handleVerify = async () => {
    if (otp.length < 4) {
      toast.error("Incomplete OTP", "Please enter the 4-digit OTP.");
      return;
    }

    const result = await apiClient.post(ENDPOINTS.auth.verifyOtp, {
      email: resolvedEmail,
      otp: otp,
    });

    if (result.success) {
      toast.success("Success", result.message || "OTP verified successfully.");
      router.push("/login");
    } else {
      toast.error("Error", result.message);
    }

    setIsLoading(false);
  };

  return (
    <LinearGradient colors={[Colors.gradient.start, Colors.gradient.end]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.centerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titleText}>Verify Email</Text>
            <Text style={styles.subtitleText}>
              Enter OTP Received{"\n"}on the entered email address
            </Text>
          </View>

          {/* Email Label */}
          <Text style={styles.emailLabel}>{email || "bikash.tlcr@gmail.com"}</Text>

          {/* OTP Input Form */}
          <View style={styles.formContainer}>
            <OtpInput length={4} onChange={setOtp} />

            <AppButton
              title={isLoading ? "" : "Verify"}
              style={styles.verifyBtnMargin}
              onPress={handleVerify}
              disabled={isLoading}
              icon={isLoading ? <ActivityIndicator color="#FFF" /> : undefined}
            />
          </View>

          {/* Resend Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.resendContainer}
            onPress={resend}
            disabled={isResendDisabled}
          >
            <Text style={styles.resendText}>{resendLabel}</Text>
          </TouchableOpacity>

          {/* Bottom Re-enter Email Link */}
          <View style={styles.bottomLinkContainer}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
              <Text style={styles.bottomLinkText}>Re-enter Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: moderateScale(100),
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
    textAlign: "center",
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
    marginTop: hp(2.5),
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
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#FFFFFF",
  },
});
