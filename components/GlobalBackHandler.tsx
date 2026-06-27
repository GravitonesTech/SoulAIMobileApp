import { useAppConfirmation } from "@/hooks/useAppConfirmation";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { BackHandler } from "react-native";

export default function GlobalBackHandler() {
  const navigation = useNavigation();
  const { showConfirmation } = useAppConfirmation();

  useEffect(() => {
    const backAction = () => {
      // If we cannot go back in the navigation stack, it means the next back action will exit the app.
      if (!navigation.canGoBack()) {
        showConfirmation(
          "Exit App",
          "Are you sure you want to exit?",
          () => {
            BackHandler.exitApp();
          },
          {
            confirmLabel: "Exit",
            cancelLabel: "Cancel",
          },
        );
        return true; // Prevent default behavior (exiting immediately)
      }
      return false; // Allow default behavior (going back to the previous screen)
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [navigation, showConfirmation]);

  return null;
}
