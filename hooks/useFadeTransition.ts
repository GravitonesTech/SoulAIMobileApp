import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export function useFadeTransition(duration = 200) {
  const router = useRouter();
  const screenOpacity = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      screenOpacity.value = 1;
    }, []),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const navigateWithFade = (path: string, options?: { replace?: boolean }) => {
    screenOpacity.value = withTiming(0, { duration }, (finished) => {
      if (finished) {
        if (options?.replace) {
          runOnJS(router.replace)(path as any);
        } else {
          runOnJS(router.push)(path as any);
        }
      }
    });
  };

  const goBackWithFade = () => {
    screenOpacity.value = withTiming(0, { duration }, (finished) => {
      if (finished) {
        runOnJS(router.back)();
      }
    });
  };

  return {
    animatedStyle,
    navigateWithFade,
    goBackWithFade,
  };
}
