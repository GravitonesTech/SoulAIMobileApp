import { AuthService } from "@/utils/auth";
import { toast } from "@/utils/toast";
import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export const useAppleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync()
        .then((available) => {
          if (isMounted) setIsAvailable(available);
        })
        .catch((err) => {
          console.error("[AppleAuth] Error checking availability:", err);
          if (isMounted) setIsAvailable(false);
        });
    } else {
      setIsAvailable(false);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async () => {
    console.log("[AppleAuth] Native Sign-In pressed");
    setIsLoading(true);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No ID token returned from Apple Sign-In.");
      }

      console.log("[AppleAuth] Native sign-in success, verifying token with backend...");
      await AuthService.loginWithSocialToken("apple", credential.identityToken);
    } catch (error: any) {
      if (
        error.code === "ERR_REQUEST_CANCELED" ||
        error.code === "ERR_CANCELED" ||
        error.code === "1001" // Apple Canceled Error Code
      ) {
        console.log("[AppleAuth] User cancelled flow");
      } else {
        console.error("[AppleAuth] Native Sign-in Error:", error);
        toast.error("Auth Error", error.message || "Apple Sign-In failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
    isAvailable,
  };
};
