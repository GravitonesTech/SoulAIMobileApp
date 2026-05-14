import { SocialButtons } from "@/components/auth/SocialButtons";
import { AppButton } from "@/components/ui/AppButton";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { AuthService } from "@/utils/auth";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AuthOptionsScreen() {
  const router = useRouter();
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const { isAuthenticated, user } = await AuthService.checkAuth();

      if (!isAuthenticated || !user) {
        setIsCheckingToken(false);
        return;
      }

      AuthService.navigateToCorrectScreen(user);

      setIsCheckingToken(false);
    };

    checkUserSession();
  }, [router]);

  if (isCheckingToken) {
    return (
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.end]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.gradient.start, Colors.gradient.end]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        {/* Header (same as first screen) */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Welcome to Soul AI</Text>
        </View>

        {/* Buttons (acts like formContainer) */}
        <View style={styles.formContainer}>
          <Text style={[styles.subtitleText, { marginBottom: hp(3.5) }]}>
            Sign in to Personalize your{"\n"}Therapy AI Companion
          </Text>

          <Text style={styles.continueWithText}>Continue with</Text>

          <AppButton
            title="Phone Number"
            variant="social"
            icon={<Feather name="message-circle" size={normalize(20)} color="#000" />}
            style={styles.inputMargin}
            onPress={() => router.push("/sendotp")}
          />

          <AppButton
            title="Email"
            variant="social"
            icon={<Feather name="mail" size={normalize(20)} color="#000" />}
            style={styles.inputMargin}
            onPress={() => router.push("/login")}
          />

          <SocialButtons />
        </View>

        {/* Divider (same position as first screen) */}
        <View style={styles.dividerContainer}>
          <Text style={styles.termsText}>
            By tapping Continue or logging into an existing Soul account, you agree to our{" "}
            <Text style={styles.linkText} onPress={() => router.push("/terms" as any)}>
              Terms
            </Text>{" "}
            and acknowledge that you have read our{" "}
            <Text style={styles.linkText} onPress={() => router.push("/privacy-policy")}>
              Privacy Policy
            </Text>
            , which explains how to opt out of our offers and promos.
          </Text>
        </View>

        {/* Bottom Link (same as first screen) */}
        <View style={styles.bottomLinkContainer}>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.bottomLinkText}>
              Don{"'"}t have an account? <Text style={styles.boldText}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

  /* SAME HEADER STRUCTURE */
  header: { marginTop: hp(6), alignItems: "center", marginBottom: hp(5) },

  titleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.title,
    color: "#FFFFFF",
    marginBottom: hp(3),
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: normalize(2) },
    textShadowRadius: normalize(4),
  },

  subtitleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.subtitle,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    lineHeight: normalize(22),
  },

  continueWithText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#FFFFFF",
    marginTop: hp(5),
    marginBottom: hp(2),
    textAlign: "center",
  },

  /* SAME AS formContainer */
  formContainer: {
    width: "100%",
    alignItems: "center",
  },

  inputMargin: {
    marginBottom: hp(1),
  },

  /* USED AS TERMS AREA */
  dividerContainer: {
    marginTop: hp(1),
    paddingHorizontal: moderateScale(10),
    alignItems: "center",
  },

  termsText: {
    fontSize: normalize(10),
    color: "#DBE7FB",
    textAlign: "center",
    opacity: 0.7,
    lineHeight: normalize(12),
  },

  linkText: {
    textDecorationLine: "underline",
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

  boldText: {
    fontFamily: Typography.fonts.bold,
  },
});
