import { AppButton } from "@/components/ui/AppButton";
import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingThreeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Soul AI</Text>
            <Text style={styles.subtitle}>
              Take a personality test to further{"\n"}improve your experience.
            </Text>
          </View>

          {/* Buttons at bottom */}
          <View style={styles.footer}>
            <AppButton
              title="Let's Talk"
              onPress={() => router.replace("/chatstarter")}
              style={styles.primaryButton}
            />

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.7}
              onPress={() => router.push("/personality-test")}
            >
              <Text style={styles.secondaryButtonText}>Take a Personality Test</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Take the WORLD HEALTH ORGANIZATION recommended assessment to improve the application
              experience.
            </Text>
          </View>
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 28,
    justifyContent: "space-between",
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(32),
    color: "#3C61DD",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(18),
    color: "#8AC9F9",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    marginBottom: 16,
  },
  secondaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#F2F9FF",
    borderWidth: 1,
    borderColor: "#3C61DD",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
    paddingHorizontal: 10,
    lineHeight: 14,
    opacity: 0.8,
  },
});
