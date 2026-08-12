import { AppButton } from "@/components/ui/AppButton";
import { OtpInput } from "@/components/ui/OtpInput";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { useFadeTransition } from "@/hooks/useFadeTransition";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const VALID_OTP = "2528";

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { animatedStyle, navigateWithFade, goBackWithFade } = useFadeTransition(200);
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
    navigateWithFade("/language", { replace: true });
  };

  const getMaskedPhone = () => {
    if (!phone) return "+91 98*****205";
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 2)}*****${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <LinearGradient colors={[Colors.gradient.start, Colors.gradient.end]} style={styles.container}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.centerContainer}>
              {/* Header */}
              <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
                <Text style={styles.titleText}>Verify Account</Text>
                <Text style={styles.subtitleText}>
                  Enter OTP Received{"\n"}on {getMaskedPhone()}
                </Text>
              </Animated.View>

              {/* OTP Input Form */}
              <Animated.View entering={FadeIn.duration(400)} style={styles.formContainer}>
                <OtpInput length={4} onChange={setOtp} />

                <AppButton title="Verify" style={styles.verifyBtnMargin} onPress={handleVerify} />
              </Animated.View>

              {/* Resend Link */}
              <Animated.View entering={FadeIn.duration(400)} style={styles.resendContainer}>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.resendText}>Resend Verification Code</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Bottom Re-enter Phone Number Link */}
              <Animated.View entering={FadeIn.duration(400)} style={styles.bottomLinkContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log("CLicked re enter");
                    router.back();
                  }}
                >
                  <Text style={styles.bottomLinkText}>Re-enter Phone Number</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
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
