import { Typography } from "@/constants/Typography";
import { hp, normalize, wp } from "@/utils/responsive";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentFailedScreen() {
  const router = useRouter();

  const handleChangePayment = () => {
    // Go back to book-session screen to try again
    router.back();
  };

  const handleContactSupport = () => {
    router.push("/customer-support");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Failed Details */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Payment Failed!</Text>
          <Text style={styles.subtitle}>Unfortunately, We couldn't{"\n"}process your payment.</Text>
        </View>

        {/* Change Payment Method Button */}
        <TouchableOpacity activeOpacity={0.85} onPress={handleChangePayment} style={styles.button}>
          <Text style={styles.buttonText}>Change Payment Method</Text>
        </TouchableOpacity>

        {/* Contact Support Link */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleContactSupport}
          style={styles.supportButton}
        >
          <Text style={styles.supportText}>Contact Support</Text>
        </TouchableOpacity>
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
    marginBottom: hp(5),
  },
  title: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(32),
    color: "#A60000",
    textAlign: "center",
    marginBottom: hp(2.5),
  },
  subtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#A60000",
    textAlign: "center",
    lineHeight: normalize(24),
  },
  button: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#A60000",
    borderRadius: normalize(12),
    paddingVertical: hp(1.8),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(4),
    shadowColor: "#A60000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#A60000",
  },
  supportButton: {
    paddingVertical: hp(1),
  },
  supportText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#3C61DD",
  },
});
