import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Exact colors matching the user's splash-style screenshot gradient
const GRADIENT_START = "#3BC0EB"; // Bright sky blue / cyan
const GRADIENT_END = "#5858E8"; // Indigo / blue-violet
const RIPPLE_COLOR = "#3C61DD"; // Calm blue water ripple color

interface RippleRingProps {
  index: number;
  masterProgress: SharedValue<number>;
}

// Concentric ring that animates from the center outwards
const RippleRing = ({ index, masterProgress }: RippleRingProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Offset each ring's progress so they are evenly distributed
    const ringProgress = (masterProgress.value + index / 4) % 1;
    return {
      transform: [{ scale: ringProgress * 4.5 + 0.5 }],
      opacity: (1 - ringProgress) * 0.3,
    };
  });

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          backgroundColor: RIPPLE_COLOR,
          borderColor: RIPPLE_COLOR,
        },
        animatedStyle,
      ]}
    />
  );
};

export default function DemoScreen() {
  const masterProgress = useSharedValue(0);

  useEffect(() => {
    masterProgress.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.out(Easing.linear),
      }),
      -1, // Loop indefinitely
      false,
    );
  }, [masterProgress]);

  return (
    <LinearGradient colors={[GRADIENT_START, GRADIENT_END]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.content}>
          {/* Animation Surface */}
          <View style={styles.rippleContainer}>
            {/* 4 Concentric water ripple waves */}
            <RippleRing index={0} masterProgress={masterProgress} />
            <RippleRing index={1} masterProgress={masterProgress} />
            <RippleRing index={2} masterProgress={masterProgress} />
            <RippleRing index={3} masterProgress={masterProgress} />

            {/* Central content container */}
            <View style={styles.centerContainer}>
              <Text style={styles.centerText}>Take a deep breath</Text>
            </View>
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
    justifyContent: "center",
    alignItems: "center",
  },
  rippleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  ring: {
    position: "absolute",
    width: normalize(120),
    height: normalize(120),
    borderRadius: normalize(60),
    borderWidth: 0.6,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  centerContainer: {
    position: "absolute",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  centerText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(20),
    color: "#FFFFFF",
    textAlign: "center",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
});
