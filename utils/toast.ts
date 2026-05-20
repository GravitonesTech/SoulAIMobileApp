import Toast from "react-native-toast-message";

export const toast = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      position: "bottom",
      visibilityTime: 2000,
      autoHide: true,
      bottomOffset: 40,
    });
  },
  error: (title: string, message?: string) => {
    console.log(`🔴 [Toast Error] Title: "${title}" | Message: "${message || ""}"`);
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position: "bottom",
      visibilityTime: 2000,
      autoHide: true,
      bottomOffset: 40,
    });
  },
  info: (title: string, message?: string) => {
    Toast.show({
      type: "info",
      text1: title,
      text2: message,
      position: "bottom",
      visibilityTime: 2000,
      autoHide: true,
      bottomOffset: 40,
    });
  },
};
