import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface SplashOverlayProps {
  /** Triggered when auth checks / minimum display timer complete */
  isReady: boolean;
  /** Callback fired after exit animation completes */
  onFinish: () => void;
}

export const SplashOverlay: React.FC<SplashOverlayProps> = ({ isReady, onFinish }) => {
  // Animation Values
  const ringsOpacity = useRef(new Animated.Value(0)).current;
  const breathScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  const [breathText, setBreathText] = useState("Breathe In");
  const [animationFinished, setAnimationFinished] = useState(false);

  // Scale interpolations (0: collapsed/normal, 1: fully expanded)
  const scale = breathScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 2.8],
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
    }).start(({ finished }) => {
      if (finished) {
        // 2. Start the 3-second rings expansion animation (Breathe In)
        Animated.timing(breathScale, {
          toValue: 1,
          duration: 3000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished: finishedIn }) => {
          if (finishedIn) {
            // Fade out text, change to Breathe Out, then fade in text while shrinking
            Animated.timing(textOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setBreathText("Breathe Out");
              Animated.parallel([
                Animated.timing(textOpacity, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
                // Animate breathScale from 1 to 0 (Breathe Out / shrinking)
                Animated.timing(breathScale, {
                  toValue: 0,
                  duration: 3000,
                  easing: Easing.out(Easing.cubic),
                  useNativeDriver: true,
                }),
              ]).start(({ finished: finishedOut }) => {
                if (finishedOut) {
                  // 3. After rings animation, fade out rings/text
                  Animated.timing(ringsOpacity, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                  }).start(({ finished: finishedFade }) => {
                    if (finishedFade) {
                      setAnimationFinished(true);
                    }
                  });
                }
              });
            });
          }
        });
      }
    });
  }, []);

  // Exit Portal Animation when isReady and animationFinished are both true
  useEffect(() => {
    if (isReady && animationFinished) {
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
  }, [isReady, animationFinished, exitOpacity, exitScale, onFinish]);

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
            <Animated.Text style={[styles.centerText, { opacity: textOpacity }]}>
              {breathText}
            </Animated.Text>
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
    fontSize: normalize(20),
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: normalize(20),
    lineHeight: normalize(24),
  },
});
