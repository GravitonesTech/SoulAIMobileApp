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

  const navigateWithFade = (
    path: string,
    options?: { replace?: boolean; clearStack?: boolean },
  ) => {
    const performNavigation = () => {
      if (options?.clearStack) {
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace(path as any);
      } else if (options?.replace) {
        router.replace(path as any);
      } else {
        router.push(path as any);
      }
    };

    screenOpacity.value = withTiming(0, { duration }, (finished) => {
      if (finished) {
        runOnJS(performNavigation)();
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
