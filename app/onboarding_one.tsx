import { AppButton } from "@/components/ui/AppButton";
import { EntryAnimations } from "@/constants/Animations";
import { Typography } from "@/constants/Typography";
import { useFadeTransition } from "@/hooks/useFadeTransition";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingOneScreen() {
  const router = useRouter();
  const { animatedStyle, navigateWithFade } = useFadeTransition(200);

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, []);

  return (
    <LinearGradient
      colors={["#3BC0EB", "#5858E8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Header Section */}
            <Animated.View entering={EntryAnimations.header} style={styles.headerContainer}>
              <Text style={styles.title}>Hey, I&apos;m Soul AI</Text>
              <Text style={styles.subtitle}>A personalized therapy{"\n"}AI Companion</Text>
            </Animated.View>

            {/* Bottom Section */}
            <Animated.View entering={EntryAnimations.formContainer} style={styles.bottomContainer}>
              <AppButton
                title="Continue"
                onPress={() => navigateWithFade("/language")}
                style={styles.button}
                textStyle={styles.buttonText}
              />

              <Text style={styles.termsText}>
                By tapping Continue or logging into an existing Soul account, you agree to our{" "}
                <Text style={styles.linkText} onPress={() => navigateWithFade("/terms")}>
                  Terms
                </Text>{" "}
                and acknowledge that you have read our{" "}
                <Text style={styles.linkText} onPress={() => navigateWithFade("/privacy-policy")}>
                  Privacy Policy
                </Text>
                , which explains how to opt out of offers and promos.
              </Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(28),
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  headerContainer: {
    alignItems: "center",
  },
  title: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(32),
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: hp(3.5),
    lineHeight: normalize(46),
  },
  subtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: normalize(22),
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#3C61DD",
    borderRadius: normalize(10),
    height: normalize(56),
    marginBottom: hp(3.7),
  },
  buttonText: {
    fontSize: normalize(16),
    fontFamily: Typography.fonts.medium,
    letterSpacing: 0.5,
  },
  termsText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: normalize(16),
    paddingHorizontal: moderateScale(15),
    opacity: 0.8,
  },
  linkText: {
    textDecorationLine: "underline",
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
