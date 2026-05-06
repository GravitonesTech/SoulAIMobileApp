import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import React from "react";
import { BaseToast, ErrorToast, ToastConfig as ToastConfigType } from "react-native-toast-message";

export const toastConfig: ToastConfigType = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.brand.dotGreen,
        backgroundColor: "#FFFFFF",
        height: 70,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 5,
        width: "90%",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontFamily: Typography.fonts.medium,
        fontSize: 16,
        color: "#111",
      }}
      text2Style={{
        fontFamily: Typography.fonts.regular,
        fontSize: 13,
        color: "#666",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#FF5252",
        backgroundColor: "#FFFFFF",
        height: 70,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 5,
        width: "90%",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontFamily: Typography.fonts.medium,
        fontSize: 16,
        color: "#111",
      }}
      text2Style={{
        fontFamily: Typography.fonts.regular,
        fontSize: 13,
        color: "#666",
      }}
    />
  ),
};
