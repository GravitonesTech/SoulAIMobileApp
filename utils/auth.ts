import { ENDPOINTS } from "@/constants/endpoints";
import { apiClient } from "@/utils/api";
import { UserProfile } from "@/types/api";
import { storage } from "@/utils/storage";
import { toast } from "@/utils/toast";
import { router } from "expo-router";
import { store } from "@/store";
import { setCredentials, logout as logoutAction } from "@/store/slices/authSlice";

export type SocialProvider = "google" | "apple";

/**
 * Verifies if the user is currently authenticated with a valid session
 */
async function checkAuth(): Promise<{ isAuthenticated: boolean; user?: UserProfile }> {
  const token = await storage.getAccessToken();
  if (!token) return { isAuthenticated: false };

  const result = await apiClient.get<UserProfile>(ENDPOINTS.users.me);

  if (result.success && result.data) {
    store.dispatch(setCredentials({ user: result.data }));
    return {
      isAuthenticated: true,
      user: result.data,
    };
  }

  return { isAuthenticated: false };
}

/**
 * Navigates the user to the appropriate screen based on their onboarding progress
 */
function navigateToCorrectScreen(user: UserProfile) {
  const { completed_step } = user;
  console.log(`[Auth] Navigating based on step: ${completed_step}`);

  if (router.canDismiss()) {
    router.dismissAll();
  }

  if (completed_step === 0) {
    router.replace("/onboarding_one");
  } else if (completed_step === 1) {
    router.replace("/onboarding_two");
  } else {
    router.replace("/chatstarter");
  }
}

/**
 * Generic handler to exchange a social provider token for an app token
 */
async function loginWithSocialToken(provider: SocialProvider, token: string) {
  const result = await apiClient.post(ENDPOINTS.auth.social(provider), { token });

  if (result.success && result.data) {
    const accessToken = result.data.access_token;
    const refreshToken = result.data.refresh_token;

    if (accessToken) {
      await storage.setAccessToken(accessToken);
      if (refreshToken) {
        await storage.setRefreshToken(refreshToken);
      }
      toast.success("Success", "Authenticated successfully!");

      const { isAuthenticated, user } = await checkAuth();
      if (isAuthenticated && user) {
        store.dispatch(setCredentials({ user }));
        navigateToCorrectScreen(user);
      } else {
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace("/onboarding_one");
      }

      return { success: true, data: result.data };
    }
  }

  toast.error("Error", result.message || "Login failed");
  return { success: false, error: result.message };
}

async function forgotPassword(email: string) {
  return apiClient.post<null>(ENDPOINTS.auth.forgotPassword, { email: email.trim() });
}

async function resetPassword(params: { email: string; otp: string; new_password: string }) {
  return apiClient.post<null>(ENDPOINTS.auth.resetPassword, {
    email: params.email.trim(),
    otp: params.otp,
    new_password: params.new_password,
  });
}

async function resendOtp(email: string) {
  return apiClient.post<null>(ENDPOINTS.auth.resendOtp, { email: email.trim() });
}

/**
 * Clears session and redirects to login
 */
async function logout() {
  await storage.removeAccessToken();
  await storage.removeRefreshToken();
  store.dispatch(logoutAction());
  router.replace("/login");
}

export const AuthService = {
  loginWithSocialToken,
  checkAuth,
  navigateToCorrectScreen,
  forgotPassword,
  resetPassword,
  resendOtp,
  logout,
};
