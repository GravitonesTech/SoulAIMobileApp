import { ENDPOINTS } from "@/constants/endpoints";
import { apiClient } from "@/utils/api";
import { storage } from "@/utils/storage";
import { toast } from "@/utils/toast";
import { router } from "expo-router";
import { Platform } from "react-native";
import {
  deleteFCMToken,
  getFCMToken,
  getInitialNotificationData,
  isSupportedPlatform,
  onMessage,
  onNotificationOpened,
  onTokenRefresh,
  requestPermission,
} from "./firebase";

// Constants for configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Lock variable to prevent concurrent token registrations
let isRegisteringToken = false;

/**
 * Service to manage Firebase Cloud Messaging (FCM) operations.
 */
export const NotificationService = {
  /**
   * Initializes the notification service.
   * Registers listeners for token refresh, foreground messages, and background opens.
   */
  async init() {
    try {
      const supported = await isSupportedPlatform();
      if (!supported) {
        console.log("ℹ️ Push notifications are not supported on this platform/browser.");
        return;
      }

      // 1. Listen for Token Refresh
      onTokenRefresh(async (newToken: string) => {
        console.log("🔄 [FCM Service] Token refreshed by Firebase:", newToken);
        await storage.removeFcmToken(); // Clear stored to force backend update
        await this.registerTokenWithBackend(newToken);
      });

      // 2. Listen for Foreground Messages
      onMessage((message: any) => {
        console.log("📩 [FCM Service] Received foreground message:", message);

        // Show in-app notification toast
        const title = message.notification?.title || "New Notification";
        const body = message.notification?.body || "You have a new message.";

        toast.inAppNotification(title, body, () => {
          this.handleNotificationNavigation(message.data);
        });
      });

      // 3. Listen for Notification click events when the app is in background/killed
      onNotificationOpened((data: any) => {
        console.log("🖱️ [FCM Service] Notification clicked:", data);
        this.handleNotificationNavigation(data);
      });

      // 4. Check if the app was opened by a notification from a closed/quit state
      const initialData = await getInitialNotificationData();
      if (initialData) {
        console.log("🚀 [FCM Service] App opened by initial notification:", initialData);
        // Delay navigation slightly to allow components and navigation stack to finish loading
        setTimeout(() => {
          this.handleNotificationNavigation(initialData);
        }, 1500);
      }

      // 5. If user is already authenticated, check permission and attempt token registration
      const token = await storage.getAccessToken();
      if (token) {
        console.log("🔐 [FCM Service] User is authenticated on startup. Checking permissions...");
        const hasPermission = await this.checkPermission();
        if (hasPermission) {
          const fcmToken = await getFCMToken();
          if (fcmToken) {
            await this.registerTokenWithBackend(fcmToken);
          }
        }
      }
    } catch (error) {
      console.error("❌ [FCM Service] Initialization failed:", error);
    }
  },

  /**
   * Checks if permission is already granted.
   */
  async checkPermission(): Promise<boolean> {
    try {
      if (Platform.OS === "web") {
        return false;
      }
      // On native, we can request permission which resolves directly if already granted
      return await requestPermission();
    } catch (error) {
      console.error("❌ [FCM Service] Error checking permission:", error);
      return false;
    }
  },

  /**
   * Requests permission explicitly (triggered by user interaction/settings).
   */
  async requestPermissionAndRegister(): Promise<boolean> {
    try {
      const supported = await isSupportedPlatform();
      if (!supported) return false;

      const granted = await requestPermission();
      if (granted) {
        console.log("✅ [FCM Service] Permission granted. Generating token...");
        const fcmToken = await getFCMToken();
        if (fcmToken) {
          await this.registerTokenWithBackend(fcmToken);
        }
      } else {
        console.warn("⚠️ [FCM Service] Notification permission denied.");
      }
      return granted;
    } catch (error) {
      console.error("❌ [FCM Service] Error requesting permission and registering:", error);
      return false;
    }
  },

  /**
   * Sends the FCM token to the backend API with automatic retry and duplicate prevention.
   */
  async registerTokenWithBackend(fcmToken: string): Promise<boolean> {
    if (!fcmToken) return false;

    // Check if we already registered this token to avoid duplicate API calls
    const storedToken = await storage.getFcmToken();
    if (storedToken === fcmToken) {
      console.log("⏭️ [FCM Service] Token already registered to backend. Skipping API call.");
      return true;
    }

    // Ensure user is authenticated before sending token
    const accessToken = await storage.getAccessToken();
    if (!accessToken) {
      console.log("⏹️ [FCM Service] User not authenticated. Delaying token registration.");
      return false;
    }

    if (isRegisteringToken) {
      console.log(
        "⏳ [FCM Service] Token registration already in progress. Skipping duplicate call.",
      );
      return false;
    }

    isRegisteringToken = true;

    let success = false;
    let attempt = 0;
    let delay = INITIAL_RETRY_DELAY;

    while (attempt < MAX_RETRIES && !success) {
      try {
        attempt++;
        console.log(
          `📤 [FCM Service] Registering token with backend (Attempt ${attempt}/${MAX_RETRIES})...`,
        );

        const response = await apiClient.put(ENDPOINTS.users.updateFcmToken, {
          fcm_token: fcmToken,
        });

        if (response.success) {
          success = true;
          await storage.setFcmToken(fcmToken);
          console.log("✅ [FCM Service] Token registered with backend successfully.");
        } else {
          throw new Error(response.message || "Failed to register token");
        }
      } catch (error: any) {
        console.error(
          `❌ [FCM Service] Backend registration failed (Attempt ${attempt}):`,
          error.message,
        );

        if (attempt < MAX_RETRIES) {
          console.log(`⏳ [FCM Service] Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }

    isRegisteringToken = false;
    return success;
  },

  async unregister(): Promise<boolean> {
    try {
      const fcmToken = await storage.getFcmToken();
      if (!fcmToken) {
        console.log("ℹ️ [FCM Service] No stored FCM token found to unregister.");
        return true;
      }

      console.log("🧹 [FCM Service] Clearing device token locally...");

      // Always clear local state
      await storage.removeFcmToken();
      await deleteFCMToken();

      return true;
    } catch (error) {
      console.error("❌ [FCM Service] Error during token cleanup:", error);
      return false;
    }
  },

  /**
   * Navigation handler based on notification payload data.
   */
  handleNotificationNavigation(data: any) {
    if (!data) return;

    try {
      // Find navigation target in the data payload
      let screenPath = data.screen || data.path || data.url;

      // Fallback: If payload has booking_id, route to the therapists & appointments screen
      if (!screenPath && data.booking_id) {
        screenPath = "/(drawer)/human-therapists";
      }

      if (!screenPath) {
        console.log(
          "ℹ️ [FCM Service] Notification clicked, but no target path specified in payload.",
        );
        return;
      }

      console.log(`🔄 [FCM Service] Navigating to: ${screenPath}`);

      // Support query parameters / JSON params if present
      let params = {};
      if (data.params) {
        try {
          params = typeof data.params === "string" ? JSON.parse(data.params) : data.params;
        } catch (e) {
          console.error("❌ [FCM Service] Error parsing payload params:", e);
        }
      }

      // Navigate using Expo Router
      router.push({
        pathname: screenPath,
        params,
      } as any);
    } catch (error) {
      console.error("❌ [FCM Service] Navigation failed:", error);
    }
  },
};
