import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

interface SplashOverlayProps {
  /** Triggered when auth checks / minimum display timer complete */
  isReady: boolean;
  /** Callback fired after exit animation completes */
  onFinish: () => void;
}

export const SplashOverlay: React.FC<SplashOverlayProps> = ({ isReady, onFinish }) => {
  // Animation Values
  const ringsOpacity = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const breathScale = useRef(new Animated.Value(0)).current;

  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  // Scale interpolations copied exactly from app/(drawer)/breathing.tsx
  const scale = breathScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });

  const outerScale1 = breathScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1.1, 3.6],
  });

  const outerScale2 = breathScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1.2, 4.8],
  });

  const outerScale3 = breathScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1.3, 6.0],
  });

  useEffect(() => {
    // 1. Fade in rings/text quickly (750ms)
    Animated.timing(ringsOpacity, {
      toValue: 1,
      duration: 750,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // 2. Start the 3-second rings expansion animation
    Animated.timing(breathScale, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        // 3. After rings animation, fade out rings and fade in the center icon
        Animated.parallel([
          Animated.timing(ringsOpacity, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(iconOpacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, []);

  // Exit Portal Animation when isReady becomes true
  useEffect(() => {
    if (isReady) {
      Animated.parallel([
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(exitScale, {
          toValue: 1.08,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }
  }, [isReady, exitOpacity, exitScale, onFinish]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          opacity: exitOpacity,
          transform: [{ scale: exitScale }],
        },
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          {/* Fading container wrapping all scaling rings */}
          <Animated.View style={[styles.ringsWrapper, { opacity: ringsOpacity }]}>
            {/* Concentric rings scaling up */}
            <Animated.View
              style={[
                styles.ring,
                styles.outerRing3,
                {
                  transform: [{ scale: outerScale3 }],
                },
              ]}
            >
              <LinearGradient
                colors={["#3C61DD", "#3BC0EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientFill}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.ring,
                styles.outerRing2,
                {
                  transform: [{ scale: outerScale2 }],
                },
              ]}
            >
              <LinearGradient
                colors={["#3C61DD", "#3BC0EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientFill}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.ring,
                styles.outerRing1,
                {
                  transform: [{ scale: outerScale1 }],
                },
              ]}
            >
              <LinearGradient
                colors={["#3C61DD", "#3BC0EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientFill}
              />
            </Animated.View>

            {/* Center circle */}
            <Animated.View
              style={[
                styles.centerCircle,
                {
                  transform: [{ scale: scale }],
                },
              ]}
            >
              <LinearGradient
                colors={["#3C61DD", "#3BC0EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientFill}
              />
            </Animated.View>
          </Animated.View>

          {/* Centered text overlay, not scaled */}
          <Animated.View
            style={[styles.textOverlay, { opacity: ringsOpacity }]}
            pointerEvents="none"
          >
            <Text style={styles.centerText}>Take a deep breath</Text>
          </Animated.View>

          {/* Centered Logo Icon fading in after the ring animation */}
          <Animated.View
            style={[styles.iconWrapper, { opacity: iconOpacity }]}
            pointerEvents="none"
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    position: "relative",
  },
  ringsWrapper: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
  },
  ring: {
    position: "absolute",
    overflow: "hidden",
  },
  outerRing3: {
    width: normalize(180),
    height: normalize(180),
    borderRadius: normalize(90),
    opacity: 0.16,
  },
  outerRing2: {
    width: normalize(150),
    height: normalize(150),
    borderRadius: normalize(75),
    opacity: 0.24,
  },
  outerRing1: {
    width: normalize(120),
    height: normalize(120),
    borderRadius: normalize(60),
    opacity: 0.32,
  },
  centerCircle: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(40),
    overflow: "hidden",
    opacity: 0.64,
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientFill: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  centerText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: normalize(20),
    lineHeight: normalize(22),
  },
  iconWrapper: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    opacity: 0,
  },
  logoImage: {
    width: normalize(240),
    height: normalize(240),
  },
});
