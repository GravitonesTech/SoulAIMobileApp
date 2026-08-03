import { API_BASE_URL } from "@/constants/Config";
import { ENDPOINTS } from "@/constants/endpoints";
import { storage } from "@/utils/storage";
import { toast } from "@/utils/toast";
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

interface RequestOptions extends AxiosRequestConfig {
  body?: any;
  _isRetry?: boolean;
  showToastOnError?: boolean;
}

export interface ApiResult<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  status: number;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
});

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.getAccessToken();
  config.headers = config.headers ?? {};

  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  // Default to JSON unless caller overrides.
  if (!(config.headers as any)["Content-Type"] && !(config.headers as any)["content-type"]) {
    (config.headers as any)["Content-Type"] = "application/json";
  }

  return config;
});

/**
 * Handles the token refresh logic.
 */
async function handleTokenRefresh(): Promise<string | null> {
  try {
    console.log("🔄 [AUTH] Refreshing access token...");
    const refreshToken = await storage.getRefreshToken();
    if (!refreshToken) {
      console.log("❌ [AUTH] No refresh token found in storage.");
      return null;
    }

    const response = await http.post(
      ENDPOINTS.auth.refresh,
      { refresh_token: refreshToken },
      {
        // Avoid interceptor loops if refresh itself 401s.
        headers: { "Content-Type": "application/json" },
      },
    );

    const data = response.data;

    if (response.status >= 200 && response.status < 300 && data?.success) {
      const newAccessToken = data.data?.access_token;
      const newRefreshToken = data.data?.refresh_token;

      if (!newAccessToken) {
        console.log("❌ [AUTH] Token refresh response missing access_token.");
        return null;
      }

      await storage.setAccessToken(String(newAccessToken));
      if (newRefreshToken) {
        await storage.setRefreshToken(String(newRefreshToken));
      }

      console.log("✅ [AUTH] Token refreshed successfully.");
      return String(newAccessToken);
    }

    console.log("❌ [AUTH] Token refresh failed:", data?.message || "Unknown error");
    return null;
  } catch (error) {
    console.error("[AUTH] Error refreshing token:", error);
    return null;
  }
}

/**
 * Core axios request function with 401 retry logic.
 */
async function requestAxios(
  endpoint: string,
  options: RequestOptions = {},
): Promise<AxiosResponse<any>> {
  const method = (options.method || "GET").toString().toUpperCase();

  const config: AxiosRequestConfig = {
    ...options,
    url: endpoint,
    method: method as any,
  };

  if (options.body !== undefined) {
    config.data = options.body;
  }

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] 🌐 [NETWORK REQUEST] ${method} ${fullUrl}`);
  if (options.body) console.log(`[${timestamp}] 📦 [REQUEST BODY]`, options.body);

  try {
    const response = await http.request(config);
    return response;
  } catch (err) {
    const error = err as AxiosError;
    const status = error.response?.status;

    if (status === 401 && !options._isRetry && endpoint !== ENDPOINTS.auth.refresh) {
      console.warn(`⚠️ [AUTH] 401 Unauthorized on ${endpoint}. Attempting token refresh...`);

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = handleTokenRefresh();
      }

      const newToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (newToken) {
        console.log(`🔁 [AUTH] Retrying ${method} ${endpoint} with new token...`);
        const retryHeaders = {
          ...(options.headers as any),
          Authorization: `Bearer ${newToken}`,
        };

        return requestAxios(endpoint, {
          ...options,
          headers: retryHeaders,
          _isRetry: true,
        });
      }

      console.error(`🔴 [AUTH] Authentication failed for ${endpoint}. Cleaning up session...`);
      await storage.removeAccessToken();
      await storage.removeRefreshToken();
    }

    throw error;
  }
}

/**
 * Standardized request wrapper to handle try-catch, JSON parsing and response formatting.
 */
async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await requestAxios(endpoint, options);
    const status = response.status;
    const responseData = response.data;

    const respTimestamp = new Date().toLocaleTimeString();
    console.log(`[${respTimestamp}] 📩 [NETWORK RESPONSE] ${status} ${fullUrl}`, responseData);

    if (status >= 200 && status < 300) {
      return {
        success: true,
        data: responseData?.data !== undefined ? responseData.data : responseData,
        message: responseData?.message || "Request successful",
        status,
      };
    } else {
      // Handle error responses (4xx, 5xx)
      const errorMsg =
        responseData?.message ||
        responseData?.detail?.message ||
        responseData?.detail?.[0]?.msg ||
        `Request failed with status ${status}`;

      return {
        success: false,
        data: responseData,
        message: errorMsg,
        status,
      };
    }
  } catch (error: any) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status ?? 0;
    const responseData: any = axiosError.response?.data;

    let errorMsg = "An unexpected error occurred";
    let isNetworkError = false;

    if (
      axiosError.code === "ECONNABORTED" ||
      axiosError.message?.toLowerCase().includes("timeout")
    ) {
      errorMsg = "The server is taking too long to respond. Please try again.";
      isNetworkError = true;
    } else if (axiosError.message === "Network Error" || !axiosError.response) {
      errorMsg = "Please check your internet connection and try again.";
      isNetworkError = true;
    } else {
      errorMsg =
        responseData?.message ||
        responseData?.detail?.message ||
        responseData?.detail?.[0]?.msg ||
        axiosError.message ||
        errorMsg;
    }

    if (options.showToastOnError !== false) {
      const errorTitle = isNetworkError ? "Network Connection Error" : "Request Failed";
      toast.error(errorTitle, errorMsg);
    }

    return {
      success: false,
      data: (responseData ?? null) as any,
      message: errorMsg,
      status,
    };
  }
}

/**
 * Public API client object.
 */
export const apiClient = {
  fetch: requestAxios,
  request: request,

  get: <T = any>(endpoint: string, options: RequestOptions = {}) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body: any, options: RequestOptions = {}) =>
    request<T>(endpoint, { ...options, method: "POST", body }),

  patch: <T = any>(endpoint: string, body: any, options: RequestOptions = {}) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),

  put: <T = any>(endpoint: string, body: any, options: RequestOptions = {}) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),

  delete: <T = any>(endpoint: string, options: RequestOptions = {}) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
