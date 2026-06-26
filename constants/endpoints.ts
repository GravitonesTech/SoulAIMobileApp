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
    /** POST — Bulk submit assessment answers */
    assessmentSubmissionsBulk: "/users/assessments/submissions/bulk",
    /** GET — Get form completion statuses */
    assessmentStatus: "/users/assessments/status",
    /** GET — Fetch top rated therapists */
    topRatedTherapists: "/users/therapists/top-rated",
    /** GET — Fetch all therapists (with page, page_size, search_query) */
    getAllTherapists: "/users/getalltherapists",
    /** GET — Fetch specific therapist details by ID */
    therapistDetails: (id: number | string) => `/users/therapists/${id}`,
    /** GET — Fetch reviews for a specific therapist */
    reviews: (therapistId: number | string) => `/users/reviews/${therapistId}`,
    /** GET — Fetch user appointments */
    myAppointments: "/users/appointments/my-appointments",
    /** POST — Book/create an appointment */
    bookAppointment: "/users/appointments/book",
    /** POST — Verify appointment payment */
    verifyAppointmentPayment: "/users/appointments/verify",
    /** GET — Fetch appointment pricing summary */
    appointmentPricingSummary: (therapistId: number | string) => `/users/appointments/pricing-summary?therapist_id=${therapistId}`,
    /** POST — Cancel an appointment */
    cancelAppointment: (id: number | string) => `/users/appointments/${id}/cancel`,
    /** GET — Fetch metadata */
    metadata: "/users/metadata",
  },

  chat: {
    /** POST — Send message to AI */
    send: "/chat/chat",
    /** GET — Fetch active chat sessions */
    sessions: "/chat/sessions",
    /** GET — Retrieve session details (Chat History) */
    sessionDetails: (sessionId: string) => `/chat/sessions/${sessionId}`,
    /** POST — Fetch sound healing based on chat history */
    soundHealing: "/chat/chat/sound-healing",
  },
  master: {
    /** GET — Fetch available therapies */
    therapies: "/master/therapies",
    /** GET — Fetch standard clinical assessment forms */
    assessmentForms: "/master/assessments/forms",
    /** GET — Fetch sound categories */
    soundCategories: "/master/sound-categories",
    /** GET — Fetch sound subcategories */
    soundSubcategories: "/master/sound-subcategories",
    /** GET — Fetch sounds for a specific category */
    categorySounds: (id: number | string) => `/master/sound-categories/${id}/sounds`,
  },
} as const;
