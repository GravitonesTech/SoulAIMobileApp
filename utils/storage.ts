import * as SecureStore from "expo-secure-store";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  FCM_TOKEN: "fcmToken",
};

async function setItem(key: string, value: string) {
  try {
    console.log(`[Storage] Setting item: ${key}`);
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`[Storage] Error setting ${key}:`, error);
  }
}

async function getItem(key: string) {
  try {
    const value = await SecureStore.getItemAsync(key);
    console.log(`[Storage] Gettiing item: ${key}, status: ${value ? "found" : "not found"}`);
    return value;
  } catch (error) {
    console.error(`[Storage] Error getting ${key}:`, error);
    return null;
  }
}

async function removeItem(key: string) {
  try {
    console.log(`[Storage] Removing item: ${key}`);
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`[Storage] Error removing ${key}:`, error);
  }
}

export const storage = {
  setItem,
  getItem,
  removeItem,

  // Specialized helpers for access token
  async getAccessToken() {
    return getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string) {
    return setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  async removeAccessToken() {
    return removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken() {
    return getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string) {
    return setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async removeRefreshToken() {
    return removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async getFcmToken() {
    return getItem(STORAGE_KEYS.FCM_TOKEN);
  },

  async setFcmToken(token: string) {
    return setItem(STORAGE_KEYS.FCM_TOKEN, token);
  },

  async removeFcmToken() {
    return removeItem(STORAGE_KEYS.FCM_TOKEN);
  },
};
