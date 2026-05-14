/**
 * Central API endpoint definitions.
 * All API paths live here — never hardcode endpoint strings in screens or services.
 */

export const ENDPOINTS = {
  auth: {
    /** POST — Register a new user (email + password) */
    register: "/auth/register",

    /** POST — Login with email + password */
    login: "/auth/login",

    /** POST — Verify email OTP */
    verifyOtp: "/auth/verify-otp",

    /** POST — Refresh access token */
    refresh: "/auth/refresh",

    /** POST — Forgot password: send OTP to email (if eligible) */
    forgotPassword: "/auth/forgot-password",

    /** POST — Reset password using email + OTP */
    resetPassword: "/auth/reset-password",

    /** POST — Resend OTP to email */
    resendOtp: "/auth/resend-otp",

    /**
     * POST — Exchange a social provider token for an app token.
     * @param provider - "google" | "apple"
     */
    social: (provider: string) => `/auth/${provider}`,
  },

  users: {
    /** GET / PATCH — Current authenticated user's profile */
    me: "/users/me",
  },

  chat: {
    /** POST — Send message to AI */
    send: "/chat/chat",
  },
  master: {
    /** GET — Fetch available therapies */
    therapies: "/master/therapies",
  },
} as const;
