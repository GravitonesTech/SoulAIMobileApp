import { useEffect, useState } from "react";
import { NotificationService } from "@/utils/notificationService";

/**
 * Reusable hook to manage notification permissions and manual registration/unregistration.
 */
export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check current permission status on mount
  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      const status = await NotificationService.checkPermission();
      if (active) {
        setHasPermission(status);
      }
    };
    checkStatus();
    return () => {
      active = false;
    };
  }, []);

  /**
   * Prompts the user for permission and automatically registers with the backend if granted.
   */
  const requestPermission = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const granted = await NotificationService.requestPermissionAndRegister();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error("❌ [useNotifications] Error requesting notification permissions:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers current device token with backend manually (if permission is already granted).
   */
  const registerDevice = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const granted = await NotificationService.checkPermission();
      if (!granted) {
        console.warn("⚠️ Notification permission not granted.");
        return false;
      }
      // Trigger token fetching and backend registration
      return await NotificationService.requestPermissionAndRegister();
    } catch (error) {
      console.error("❌ [useNotifications] Error registering device:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unregisters the current device from notifications.
   */
  const unregisterDevice = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      return await NotificationService.unregister();
    } catch (error) {
      console.error("❌ [useNotifications] Error unregistering device:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasPermission,
    isLoading,
    requestPermission,
    registerDevice,
    unregisterDevice,
  };
};
export default useNotifications;
