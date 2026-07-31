import { useAppConfirmation } from "@/hooks/useAppConfirmation";
import { usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler } from "react-native";

const EXIT_APP_ROUTES = [
  "/",
  "/chatstarter",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/sendotp",
  "/verify",
  "/emailverify",
  "/language",
  "/userdetailinput",
  "/experience",
  "/onboarding_one",
  "/onboarding_two",
  "/onboarding_three",
];

export default function GlobalBackHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const { showConfirmation } = useAppConfirmation();

  useEffect(() => {
    const backAction = () => {
      // If we can go back in the Expo Router stack, pop the stack
      if (router.canGoBack()) {
        router.back();
        return true;
      }

      // If we cannot go back in the stack, we are at the root of the navigation stack.
      const shouldExit = EXIT_APP_ROUTES.includes(pathname);

      if (shouldExit) {
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
      } else {
        router.replace("/chatstarter");
      }
      return true; // Prevent default behavior (exiting immediately)
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [pathname, router, showConfirmation]);

  return null;
}
