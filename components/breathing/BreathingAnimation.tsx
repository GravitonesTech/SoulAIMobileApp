import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface BreathingAnimationProps {
  currentBreathState: "inhale" | "hold_in" | "exhale" | "hold_out";
  scale: Animated.AnimatedInterpolation<string | number>;
  outerScale1: Animated.AnimatedInterpolation<string | number>;
  outerScale2: Animated.AnimatedInterpolation<string | number>;
  outerScale3: Animated.AnimatedInterpolation<string | number>;
}

export default function BreathingAnimation({
  currentBreathState,
  scale,
  outerScale1,
  outerScale2,
  outerScale3,
}: BreathingAnimationProps) {
  const [displayedText, setDisplayedText] = React.useState("");
  const textOpacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const newText =
      currentBreathState === "inhale"
        ? "Breathe In"
        : currentBreathState === "hold_in"
        ? "Hold"
        : currentBreathState === "exhale"
        ? "Breathe Out"
        : currentBreathState === "hold_out"
        ? "Hold"
        : "";

    if (!displayedText) {
      setDisplayedText(newText);
      return;
    }

    textOpacity.stopAnimation();
    Animated.timing(textOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setDisplayedText(newText);
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }, [currentBreathState]);

  return (
    <View style={styles.animationArea}>
      <View style={styles.animationContainer}>
        {/* Outer concentric ring 3 */}
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

        {/* Outer concentric ring 2 */}
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

        {/* Outer concentric ring 1 */}
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

        {/* Text centered, not scaled */}
        <Animated.View
          style={[styles.textOverlayContainer, { opacity: textOpacity }]}
          pointerEvents="none"
        >
          <Text style={styles.breathText} numberOfLines={1} adjustsFontSizeToFit>
            {displayedText}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  animationArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animationContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",
    height: "100%",
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
  textOverlayContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  breathText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(36),
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: normalize(10),
  },
});
