import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { OtpInput } from "@/components/ui/OtpInput";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { AuthService } from "@/utils/auth";
import { toast } from "@/utils/toast";
import { useResendOtpCooldown } from "@/hooks/useResendOtpCooldown";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hp, moderateScale, normalize } from "@/utils/responsive";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const email = useMemo(() => {
    const raw = (params.email ?? "") as string | string[];
    return typeof raw === "string" ? raw : (raw[0] ?? "");
  }, [params.email]);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    resend,
    resendLabel,
    isDisabled: isResendDisabled,
  } = useResendOtpCooldown({
    email,
    baseLabel: "Resend OTP",
    disabled: isLoading,
  });

  const handleReset = async () => {
    if (!email.trim()) {
      toast.error("Error", "Email is missing. Please go back and retry.");
      return;
    }
    if (otp.trim().length < 4) {
      toast.error("Incomplete OTP", "Please enter the 4-digit OTP.");
      return;
    }
    if (!newPassword) {
      toast.error("Error", "Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const result = await AuthService.resetPassword({
      email,
      otp: otp.trim(),
      new_password: newPassword,
    });
    setIsLoading(false);

    if (result.success) {
      toast.success("Success", result.message || "Password reset successfully.");
      router.replace("/login");
      return;
    }

    toast.error("Error", result.message || "Unable to reset password.");
  };

  return (
    <LinearGradient colors={[Colors.gradient.start, Colors.gradient.end]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1, width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.titleText}>Reset Password</Text>
              <Text style={styles.subtitleText}>
                Enter the OTP sent to your email and set a new password.
              </Text>
            </View>

            <Text style={styles.emailLabel}>{email}</Text>

            <View style={styles.formContainer}>
              <OtpInput length={4} onChange={setOtp} />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={resend}
                disabled={isResendDisabled}
                style={styles.resendContainer}
              >
                <Text style={styles.resendText}>{resendLabel}</Text>
              </TouchableOpacity>

              <AppInput
                iconName="lock"
                placeholder="New Password*"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.inputMargin}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#555555" />
                  </TouchableOpacity>
                }
              />

              <AppInput
                iconName="lock"
                placeholder="Confirm Password*"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.inputMargin}
              />

              <AppButton
                title={isLoading ? "" : "Reset Password"}
                style={styles.primaryBtn}
                onPress={handleReset}
                disabled={isLoading}
                icon={isLoading ? <ActivityIndicator color="#FFF" /> : undefined}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.back()}
                style={styles.backLink}
                disabled={isLoading}
              >
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: moderateScale(28),
    paddingTop: moderateScale(48),
    paddingBottom: moderateScale(260),
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
    textAlign: "center",
  },
  emailLabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#FFFFFF",
    opacity: 0.75,
    marginBottom: hp(2.5),
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  resendContainer: {
    marginTop: hp(1.2),
    marginBottom: hp(0.8),
  },
  resendText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#FFFFFF",
    opacity: 0.7,
  },
  inputMargin: {
    marginTop: hp(1.5),
  },
  primaryBtn: {
    marginTop: hp(2),
  },
  backLink: {
    marginTop: hp(2),
  },
  backText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#FFFFFF",
    opacity: 0.9,
  },
});
