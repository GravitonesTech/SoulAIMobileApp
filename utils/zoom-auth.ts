import axios from "axios";
import CryptoJS from "crypto-js";

// Helper to base64url encode
const base64url = (source: CryptoJS.lib.WordArray): string => {
  let encodedSource = CryptoJS.enc.Base64.stringify(source);
  encodedSource = encodedSource.replace(/=+$/, "");
  encodedSource = encodedSource.replace(/\+/g, "-");
  encodedSource = encodedSource.replace(/\//g, "_");
  return encodedSource;
};

/**
 * Generate a Zoom SDK JWT token client-side (for development/testing only).
 */
export const generateZoomJWT = (
  sdkKey: string,
  sdkSecret: string,
  meetingNumber?: string,
  role: number = 0,
): string => {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2; // 2 hours expiration

  const oHeader = { alg: "HS256", typ: "JWT" };
  const oPayload: Record<string, any> = {
    sdkKey: sdkKey,
    appKey: sdkKey,
    role: role,
    iat: iat,
    exp: exp,
    tokenExp: exp,
  };

  if (meetingNumber) {
    oPayload.mn = meetingNumber;
  }

  const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(oHeader));
  const encodedHeader = base64url(stringifiedHeader);

  const stringifiedPayload = CryptoJS.enc.Utf8.parse(JSON.stringify(oPayload));
  const encodedPayload = base64url(stringifiedPayload);

  const signature = CryptoJS.HmacSHA256(`${encodedHeader}.${encodedPayload}`, sdkSecret);
  const encodedSignature = base64url(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};

/**
 * Obtain a Zoom SDK JWT token using the configured strategy.
 */
export const getZoomToken = async (meetingNumber?: string, role: number = 0): Promise<string> => {
  const tokenUrl = process.env.EXPO_PUBLIC_ZOOM_TOKEN_URL;
  const staticToken = process.env.EXPO_PUBLIC_ZOOM_JWT_TOKEN;
  const sdkKey = process.env.EXPO_PUBLIC_ZOOM_SDK_KEY;
  const sdkSecret = process.env.EXPO_PUBLIC_ZOOM_SDK_SECRET;

  // 1. Try to fetch from backend token generation service if configured
  if (tokenUrl) {
    try {
      const response = await axios.post(tokenUrl, {
        meetingNumber,
        role,
      });
      if (response.data && response.data.token) {
        return response.data.token;
      }
      if (response.data && response.data.signature) {
        return response.data.signature;
      }
    } catch (error) {
      console.warn("Failed to fetch Zoom token from backend server:", error);
    }
  }

  // 2. Try static token
  if (staticToken) {
    return staticToken;
  }

  // 3. Try generating client-side (dev/testing fallback)
  if (sdkKey && sdkSecret) {
    return generateZoomJWT(sdkKey, sdkSecret, meetingNumber, role);
  }

  // 4. Ultimate fallback/mock token for UI testing
  console.warn(
    "Zoom credentials not found in environment. Please check your EXPO_PUBLIC_ZOOM_SDK_KEY and EXPO_PUBLIC_ZOOM_SDK_SECRET.",
  );
  return generateZoomJWT("mock_sdk_key", "mock_sdk_secret", meetingNumber, role);
};
