import { SocialButtons } from "@/components/auth/SocialButtons";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { EntryAnimations } from "@/constants/Animations";
import { ENDPOINTS } from "@/constants/endpoints";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { useFadeTransition } from "@/hooks/useFadeTransition";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { validatePassword } from "@/utils/validation";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { animatedStyle, navigateWithFade } = useFadeTransition(200);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast.error("Error", "Please enter your email address.");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Error", "Please enter a valid email address.");
      return;
    }

    const pwdValidation = validatePassword(password);
    if (!pwdValidation.isValid) {
      toast.error("Invalid Password", pwdValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const result = await apiClient.post(ENDPOINTS.auth.register, {
      email: email.trim(),
      password: password,
    });

    if (result.success) {
      toast.success("Success", result.message || "OTP sent to your email.");
      navigateWithFade(`/emailverify?email=${encodeURIComponent(email.trim())}`);
    } else {
      toast.error("Error", result.message);
    }

    setIsLoading(false);
  };

  return (
    <LinearGradient colors={[Colors.gradient.start, Colors.gradient.end]} style={styles.container}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
              {/* Header */}
              <Animated.View entering={EntryAnimations.header} style={styles.header}>
                <Text style={styles.titleText}>Get Started</Text>
                <Text style={styles.subtitleText}>Create your personalized experience</Text>
              </Animated.View>

              {/* Form */}
              <Animated.View entering={EntryAnimations.formContainer} style={styles.formContainer}>
                <AppInput
                  iconName="user"
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.inputMargin}
                />

                <AppInput
                  iconName="lock"
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  style={styles.inputMargin}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Feather
                        name={showPassword ? "eye" : "eye-off"}
                        size={normalize(20)}
                        color="#555555"
                      />
                    </TouchableOpacity>
                  }
                />

                {isPasswordFocused && <PasswordRequirements password={password} />}

                <AppInput
                  iconName="lock"
                  placeholder="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.inputMargin}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Feather
                        name={showConfirmPassword ? "eye" : "eye-off"}
                        size={normalize(20)}
                        color="#555555"
                      />
                    </TouchableOpacity>
                  }
                />

                <AppButton
                  title={isLoading ? "" : "Send OTP"}
                  style={styles.signInBtnMargin}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                  icon={isLoading ? <ActivityIndicator color="#FFF" /> : undefined}
                />
              </Animated.View>

              {/* Divider */}
              <Animated.View
                entering={EntryAnimations.formContainer}
                style={styles.dividerContainer}
              >
                <Text style={styles.dividerText}>Or Sign Up With</Text>
              </Animated.View>

              {/* Social Logins */}
              <Animated.View
                entering={EntryAnimations.formContainer}
                style={styles.socialContainer}
              >
                <SocialButtons style={{ width: "100%" }} />
              </Animated.View>

              {/* Bottom Link */}
              <Animated.View
                entering={EntryAnimations.formContainer}
                style={styles.bottomLinkContainer}
              >
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigateWithFade("/login")}>
                  <Text style={styles.bottomLinkText}>Already have an account? Sign in</Text>
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: moderateScale(28),
    paddingTop: moderateScale(48),
    paddingBottom: moderateScale(40),
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: hp(7),
  },
  titleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.title,
    color: "#FFFFFF",
    marginBottom: hp(1),
  },
  subtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.subtitle,
    color: "#FFFFFF",
    opacity: 0.6,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  inputMargin: {
    marginBottom: hp(1.5),
  },
  signInBtnMargin: {
    marginTop: hp(0.5),
  },
  dividerContainer: {
    marginTop: hp(4),
    marginBottom: hp(2.5),
    alignItems: "center",
  },
  dividerText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#DBE7FB",
    opacity: 0.6,
  },
  socialContainer: {
    width: "100%",
    alignItems: "center",
  },
  bottomLinkContainer: {
    marginTop: hp(4),
    alignItems: "center",
  },
  bottomLinkText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
});
