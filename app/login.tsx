import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { ENDPOINTS } from "@/constants/endpoints";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { apiClient } from "@/utils/api";
import { AuthService } from "@/utils/auth";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { storage } from "@/utils/storage";
import { toast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      toast.error("Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    const result = await apiClient.post(ENDPOINTS.auth.login, {
      email: email.trim(),
      password: password,
    });

    if (result.success && result.data) {
      await storage.setAccessToken(result.data.access_token);
      if (result.data.refresh_token) {
        await storage.setRefreshToken(result.data.refresh_token);
      }

      const { isAuthenticated, user } = await AuthService.checkAuth();
      if (isAuthenticated && user) {
        dispatch(setCredentials({ user }));
        AuthService.navigateToCorrectScreen(user);
      } else {
        router.replace("/onboarding_one");
      }
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
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titleText}>Soul AI</Text>
            <Text style={styles.subtitleText}>Sign in to your Soul AI account</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <AppInput
              iconName="user"
              placeholder="Email*"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={styles.inputMargin}
            />

            <AppInput
              iconName="lock"
              placeholder="Password*"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
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

            <AppButton
              title={isLoading ? "" : "Sign In"}
              style={styles.signInBtnMargin}
              onPress={handleLogin}
              disabled={isLoading}
              icon={isLoading ? <ActivityIndicator color="#FFF" /> : undefined}
            />

            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/forgot-password")}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Social Divider */}
            {/* <View style={styles.dividerContainer}>
              <Text style={styles.dividerText}>Or sign in with</Text>
            </View> */}

            {/* Social Buttons */}
            {/* <SocialButtons style={styles.socialContainer} /> */}
          </View>

          {/* Bottom Link */}
          <View style={styles.bottomLinkContainer}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/signup")}>
              <Text style={styles.bottomLinkText}>Don&apos;t have an account? Create one</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: moderateScale(108),
    paddingBottom: moderateScale(12),
  },
  header: { marginTop: hp(6), alignItems: "center", marginBottom: hp(6) },
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
  socialBtnMargin: {
    marginBottom: hp(2),
  },
  bottomLinkContainer: {
    marginTop: hp(4),
    alignItems: "center",
  },
  bottomLinkText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: hp(1),
  },

  forgotPasswordText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(13),
    color: "#FFFFFF",
  },
});
