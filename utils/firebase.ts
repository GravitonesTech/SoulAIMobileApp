import messaging from "@react-native-firebase/messaging";
import { requestNotifications } from "react-native-permissions";

// Register background handler early in the app lifecycle
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("📱 [FCM Native] Background message received:", remoteMessage);
});

/**
 * Returns the native Firebase Messaging instance.
 */
export const getMessagingInstance = async () => {
  return messaging();
};

/**
 * Native platforms fully support Firebase messaging.
 */
export const isSupportedPlatform = async () => {
  return true;
};

/**
 * Requests push notification permissions on Native.
 */
export const requestPermission = async (): Promise<boolean> => {
  try {
    const { status } = await requestNotifications(["alert", "sound", "badge"]);
    const enabled = status === "granted" || status === "limited";
    console.log("📱 [Permissions] Notification status:", status, "enabled:", enabled);
    return enabled;
  } catch (error) {
    console.error("❌ [Permissions] Error requesting permission:", error);
    return false;
  }
};

/**
 * Retrieves the FCM token on Native.
 */
export const getFCMToken = async (_vapidKey?: string): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    console.log("🔑 [FCM Native] Token generated successfully.");
    return token;
  } catch (error) {
    console.error("❌ [FCM Native] Error getting token:", error);
    return null;
  }
};

/**
 * Deletes the local FCM token on Native.
 */
export const deleteFCMToken = async (): Promise<boolean> => {
  try {
    await messaging().deleteToken();
    console.log("🗑️ [FCM Native] Token deleted successfully.");
    return true;
  } catch (error) {
    console.error("❌ [FCM Native] Error deleting token:", error);
    return false;
  }
};

/**
 * Subscribes to token refresh events on Native.
 */
export const onTokenRefresh = (callback: (token: string) => void): (() => void) => {
  return messaging().onTokenRefresh(callback);
};

/**
 * Subscribes to foreground message events on Native.
 */
export const onMessage = (callback: (message: any) => void): (() => void) => {
  return messaging().onMessage((remoteMessage) => {
    // Standardize Native payload structure to match Web
    callback({
      notification: remoteMessage.notification
        ? {
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
          }
        : undefined,
      data: remoteMessage.data,
      messageId: remoteMessage.messageId,
    });
  });
};

/**
 * Subscribes to notification opened events (from background) on Native.
 */
export const onNotificationOpened = (callback: (data: any) => void): (() => void) => {
  return messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log(
      "📱 [FCM Native] Notification caused app to open from background state:",
      remoteMessage,
    );
    callback(remoteMessage.data);
  });
};

/**
 * Retrieves initial notification if the app was opened from a closed state by a notification.
 */
export const getInitialNotificationData = async (): Promise<any | null> => {
  try {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      console.log(
        "📱 [FCM Native] Notification caused app to open from quit state:",
        remoteMessage,
      );
      return remoteMessage.data || null;
    }
  } catch (error) {
    console.error("❌ [FCM Native] Error getting initial notification:", error);
  }
  return null;
};
