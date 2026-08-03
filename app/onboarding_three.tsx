import { AppButton } from "@/components/ui/AppButton";
import { EntryAnimations } from "@/constants/Animations";
import { Typography } from "@/constants/Typography";
import { useFadeTransition } from "@/hooks/useFadeTransition";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingThreeScreen() {
  const router = useRouter();
  const { animatedStyle, navigateWithFade } = useFadeTransition(200);

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Header */}
            <Animated.View entering={EntryAnimations.header} style={styles.header}>
              <Text style={styles.title}>Welcome to Soul AI</Text>
              <Text style={styles.subtitle}>
                Take a personality test to further{"\n"}improve your experience.
              </Text>
            </Animated.View>

            {/* Buttons at bottom */}
            <Animated.View entering={EntryAnimations.formContainer} style={styles.footer}>
              <AppButton
                title="Let's Talk"
                onPress={() => {
                  if (router.canDismiss()) {
                    router.dismissAll();
                  }
                  navigateWithFade("/chatstarter", { replace: true });
                }}
                style={styles.primaryButton}
              />

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.7}
                onPress={() => navigateWithFade("/personality-test")}
              >
                <Text style={styles.secondaryButtonText}>Take a Personality Test</Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Take the WORLD HEALTH ORGANIZATION recommended assessment to improve the application
                experience.
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
    justifyContent: "space-between",
    paddingVertical: moderateScale(196),
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(32),
    color: "#3C61DD",
    textAlign: "center",
    marginBottom: hp(2),
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
    color: "#3C61DD",
    textAlign: "center",
    lineHeight: normalize(24),
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    marginBottom: hp(2),
  },
  secondaryButton: {
    width: "100%",
    height: normalize(52),
    backgroundColor: "#F2F9FF",
    borderWidth: 1,
    borderColor: "#3C61DD",
    borderRadius: normalize(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2.5),
  },
  secondaryButtonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(18),
    color: "#3C61DD",
  },
  footerText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(10),
    color: "#3C61DD",
    textAlign: "center",
    paddingHorizontal: moderateScale(10),
    lineHeight: normalize(14),
    opacity: 0.8,
  },
});
