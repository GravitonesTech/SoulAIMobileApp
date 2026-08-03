import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, View } from "react-native";

interface PaymentVerificationOverlayProps {
  visible: boolean;
  therapistName?: string;
}

export const PaymentVerificationOverlay: React.FC<PaymentVerificationOverlayProps> = ({
  visible,
  therapistName,
}) => {
  const rotateValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in overlay
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Continuous rotation for spinner
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      // Pulse animation for inner circle
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1.0,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      // Reset animations
      rotateValue.setValue(0);
      pulseValue.setValue(1);
      opacityValue.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pulseScale = pulseValue.interpolate({
    inputRange: [1, 1.15],
    outputRange: [1, 1.15],
  });

  return (
    <Modal transparent animationType="none" visible={visible}>
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop, { opacity: opacityValue }]} />
        <LinearGradient colors={["#FFFFFF", "#E2F4FF"]} style={styles.gradientContainer}>
          <View style={styles.cardContainer}>
            {/* Pulsing & Rotating Animation Rings */}
            <View style={styles.animationWrapper}>
              {/* Outer rotating semi-transparent arc/circle */}
              <Animated.View
                style={[
                  styles.spinnerRing,
                  {
                    transform: [{ rotate: spin }],
                  },
                ]}
              />

              {/* Pulsing inner backdrop */}
              <Animated.View
                style={[
                  styles.pulseBackdrop,
                  {
                    transform: [{ scale: pulseScale }],
                  },
                ]}
              />

              {/* Central static icon container */}
              <View style={styles.iconCircle}>
                <Feather name="shield" size={normalize(36)} color="#3C61DD" />
              </View>
            </View>

            {/* Verification Content */}
            <Text style={styles.title}>Verifying Payment</Text>
            <Text style={styles.subtitle}>
              {therapistName
                ? `Confirming appointment with ${therapistName}...`
                : "Securing your session slot..."}
            </Text>

            {/* Informational Message Box */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                We are validating the payment receipt with Razorpay and updating your schedule.
              </Text>
              <Text style={styles.warningText}>
                Please do not close the app, lock your phone, or press the back button.
              </Text>
            </View>

            {/* Footer lock and brand logo */}
            <View style={styles.footerRow}>
              <Feather
                name="lock"
                size={normalize(14)}
                color="#3C61DD"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.footerText}>Secure Payment via Razorpay</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  gradientContainer: {
    width: wp(90),
    borderRadius: normalize(24),
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(36),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
  },
  animationWrapper: {
    width: normalize(120),
    height: normalize(120),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(3.5),
  },
  spinnerRing: {
    position: "absolute",
    width: normalize(100),
    height: normalize(100),
    borderRadius: normalize(50),
    borderWidth: 3.5,
    borderColor: "rgba(60, 97, 221, 0.25)",
    borderTopColor: "#3C61DD",
  },
  pulseBackdrop: {
    position: "absolute",
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(40),
    backgroundColor: "rgba(60, 97, 221, 0.08)",
  },
  iconCircle: {
    width: normalize(70),
    height: normalize(70),
    borderRadius: normalize(35),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(22),
    color: "#1E293B",
    textAlign: "center",
    marginBottom: hp(0.8),
  },
  subtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#3C61DD",
    textAlign: "center",
    marginBottom: hp(3.5),
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: hp(4),
  },
  infoText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13.5),
    color: "#64748B",
    textAlign: "center",
    lineHeight: normalize(20),
    marginBottom: hp(1.2),
  },
  warningText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12.5),
    color: "#EF4444",
    textAlign: "center",
    lineHeight: normalize(18),
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  },
  footerText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#475569",
  },
});
