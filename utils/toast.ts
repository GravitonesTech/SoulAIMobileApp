import Toast from "react-native-toast-message";

export const toast = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 60,
    });
  },
  error: (title: string, message?: string) => {
    console.log(`🔴 [Toast Error] Title: "${title}" | Message: "${message || ""}"`);
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 60,
    });
  },
  info: (title: string, message?: string) => {
    Toast.show({
      type: "info",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 60,
    });
  },
  inAppNotification: (title: string, message: string, onPress: () => void) => {
    Toast.show({
      type: "inAppNotification",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 5000,
      autoHide: true,
      topOffset: 50,
      props: {
        onPress,
      },
    });
  },
};
