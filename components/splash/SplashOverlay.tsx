import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { hp, normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";

interface SplashOverlayProps {
  /** Triggered when auth checks / minimum display timer complete */
  isReady: boolean;
  /** Callback fired after exit animation completes */
  onFinish: () => void;
}

export const SplashOverlay: React.FC<SplashOverlayProps> = ({ isReady, onFinish }) => {
  // Animation Values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;

  // Two-Stage Tagline Animations
  const part1Opacity = useRef(new Animated.Value(0)).current;
  const part1TranslateX = useRef(new Animated.Value(-35)).current;

  const part2Opacity = useRef(new Animated.Value(0)).current;
  const part2TranslateX = useRef(new Animated.Value(35)).current;

  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Step 1: Smooth fade-in of logo in exact center (550ms)
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      // Step 2: Hold logo in center (750ms), then lift logo & reveal Part 1 ("A Calm Mind.") sliding from left
      Animated.sequence([
        Animated.delay(750),
        Animated.parallel([
          Animated.timing(logoTranslateY, {
            toValue: -hp(5.5),
            duration: 850,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(part1Opacity, {
            toValue: 1,
            duration: 850,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(part1TranslateX, {
            toValue: 0,
            duration: 850,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        // Step 3: Brief delay (250ms), then reveal Part 2 ("A Stronger Soul.") sliding from right
        Animated.delay(250),
        Animated.parallel([
          Animated.timing(part2Opacity, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(part2TranslateX, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
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
          {/* Centered Logo Image with Lift-Up Animation */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [{ translateY: logoTranslateY }],
              },
            ]}
          >
            <Image
              source={require("@/assets/images/splash_screen.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Two-stage Tagline reveal anchored below logo */}
          <View style={styles.taglineWrapper}>
            <Animated.Text
              style={[
                styles.taglineText,
                {
                  opacity: part1Opacity,
                  transform: [{ translateX: part1TranslateX }],
                },
              ]}
            >
              A Calm Mind.
            </Animated.Text>

            <Animated.Text
              style={[
                styles.taglineText,
                styles.taglinePart2,
                {
                  opacity: part2Opacity,
                  transform: [{ translateX: part2TranslateX }],
                },
              ]}
            >
              A Stronger Soul.
            </Animated.Text>
          </View>
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
    position: "relative",
  },
  logoWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: normalize(220),
    height: normalize(220),
  },
  taglineWrapper: {
    position: "absolute",
    top: normalize(165),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: normalize(16),
  },
  taglineText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglinePart2: {
    fontFamily: Typography.fonts.bold,
    marginLeft: normalize(6),
  },
});
