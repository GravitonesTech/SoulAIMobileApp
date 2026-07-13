import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, normalize, wp } from "@/utils/responsive";
import { Typography } from "@/constants/Typography";

export default function BookingSuccessScreen() {
  const router = useRouter();

  const handleContinue = () => {
    // Navigate back to human therapists screen (where the appointments list is housed)
    router.replace("/(drawer)/human-therapists");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Confirmed Details */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Session Confirmed!</Text>
          <Text style={styles.subtitle}>
            {"Your payment is successful! We've added new consultation appointment."}
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleContinue}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={["#3C61DD", "#5D85F3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer Policy Text */}
        <Text style={styles.footerText}>
          By tapping Continue or logging into an existing Soul account, you agree to our{" "}
          <Text style={styles.linkText} onPress={() => router.push("/terms")}>
            Terms
          </Text>{" "}
          and acknowledge that you have read our{" "}
          <Text style={styles.linkText} onPress={() => router.push("/privacy-policy")}>
            Privacy Policy
          </Text>
          , which explains how to opt out of offers and promos.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7FE",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(8),
  },
  textContainer: {
    alignItems: "center",
    marginBottom: hp(6),
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(28),
    color: "#3C61DD",
    textAlign: "center",
    marginBottom: hp(2),
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(15),
    color: "#8FA3DF",
    textAlign: "center",
    lineHeight: normalize(22),
    paddingHorizontal: wp(4),
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: normalize(12),
    overflow: "hidden",
    marginBottom: hp(4),
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  button: {
    width: "100%",
    paddingVertical: hp(1.8),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#FFF",
  },
  footerText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#8FA3DF",
    textAlign: "center",
    lineHeight: normalize(16),
    paddingHorizontal: wp(6),
    position: "absolute",
    bottom: hp(4),
  },
  linkText: {
    fontFamily: Typography.fonts.bold,
    textDecorationLine: "underline",
    color: "#7E97DF",
  },
});
