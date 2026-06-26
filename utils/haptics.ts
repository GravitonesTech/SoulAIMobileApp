import * as Haptics from "expo-haptics";

export const haptics = {
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch((err) => {
      console.warn("[Haptics] Light impact failed", err);
    });
  },
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch((err) => {
      console.warn("[Haptics] Medium impact failed", err);
    });
  },
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch((err) => {
      console.warn("[Haptics] Heavy impact failed", err);
    });
  },
  selection: () => {
    Haptics.selectionAsync().catch((err) => {
      console.warn("[Haptics] Selection haptic failed", err);
    });
  },
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch((err) => {
      console.warn("[Haptics] Success notification failed", err);
    });
  },
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch((err) => {
      console.warn("[Haptics] Warning notification failed", err);
    });
  },
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch((err) => {
      console.warn("[Haptics] Error notification failed", err);
    });
  },
};
