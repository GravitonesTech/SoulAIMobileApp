import { AuthService } from "@/utils/auth";
import { toast } from "@/utils/toast";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useState, useEffect } from "react";

type GoogleOAuthClientIds = {
  androidClientId?: string;
  iosClientId?: string;
  webClientId?: string;
};

export function getGoogleOAuthClientIds(): GoogleOAuthClientIds {
  const extra = Constants.expoConfig?.extra as any;
  const fromExtra: GoogleOAuthClientIds | undefined = extra?.googleOAuth;

  return {
    androidClientId: fromExtra?.androidClientId ?? undefined,
    iosClientId: fromExtra?.iosClientId ?? undefined,
    webClientId: fromExtra?.webClientId ?? undefined,
  };
}

export function hasGoogleOAuthClientId(): boolean {
  const ids = getGoogleOAuthClientIds();
  if (Platform.OS === "android") return !!ids.androidClientId;
  if (Platform.OS === "ios") return !!ids.iosClientId;
  return !!ids.webClientId;
}

// Configure Google Sign-in
const clientIds = getGoogleOAuthClientIds();
GoogleSignin.configure({
  webClientId: clientIds.webClientId,
  iosClientId: clientIds.iosClientId !== "REPLACE_ME" ? clientIds.iosClientId : undefined,
  offlineAccess: true,
});

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    console.log("[GoogleAuth] Native Sign-In pressed");
    setIsLoading(true);

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      if (response.type !== "success") {
        throw new Error("Google Sign-In was not successful or was cancelled.");
      }

      const idToken = response.data.idToken;

      if (!idToken) {
        throw new Error("No ID token returned from Google Sign-In.");
      }

      console.log("[GoogleAuth] Native sign-in success, verifying token with backend...");
      await AuthService.loginWithSocialToken("google", idToken);

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("[GoogleAuth] User cancelled flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("[GoogleAuth] Sign-in already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        toast.error("Play Services Error", "Google Play Services not available or outdated.");
      } else {
        console.error("[GoogleAuth] Native Sign-in Error:", error);
        toast.error("Auth Error", error.message || "Google Sign-In failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error("[GoogleAuth] Sign-out Error:", error);
    }
  };

  return {
    signIn,
    signOut,
    isLoading,
    isReady: true,
  };
};
