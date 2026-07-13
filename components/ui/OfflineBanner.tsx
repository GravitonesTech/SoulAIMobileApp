import { Typography } from "@/constants/Typography";
import { moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function OfflineBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const insets = useSafeAreaInsets();

  // Slide animation: translateY initially hidden above the screen
  const translateY = useSharedValue(-200);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // NetInfo state.isConnected can be null initially.
      // We only treat it as offline if it is explicitly false.
      const connected = state.isConnected !== false;
      setIsConnected(connected);

      if (!connected) {
        // Slide down to visible position
        translateY.value = withTiming(0, { duration: 300 });
      } else {
        // Slide up to hidden position
        translateY.value = withTiming(-200, { duration: 300 });
      }
    });

    return () => unsubscribe();
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 4,
    };
  });

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents={isConnected ? "none" : "auto"}
    >
      <View style={styles.content}>
        <Feather name="wifi-off" size={normalize(16)} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.text}>You are currently offline. Check your connection.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FF3B30", // Vibrant red warning color
    zIndex: 9999,
    paddingBottom: moderateScale(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(16),
  },
  icon: {
    marginRight: moderateScale(8),
  },
  text: {
    color: "#FFFFFF",
    fontSize: normalize(13),
    fontFamily: Typography.fonts.medium || "System",
    textAlign: "center",
  },
});
