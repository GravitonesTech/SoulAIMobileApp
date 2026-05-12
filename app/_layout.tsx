import { toastConfig } from "@/components/ToastConfig";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppActionSheet } from "@/hooks/useAppActionSheet";
import { AppConfirmation } from "@/hooks/useAppConfirmation";
import { store } from "@/store";
import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito-sans";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            {/* splash screen we built the primary initial route */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* login screen full screen without the default header */}
            <Stack.Screen name="login" options={{ headerShown: false }} />
            {/* signup screen full screen without the default header */}
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="reset-password" options={{ headerShown: false }} />
            {/* sendotp screen full screen without the default header */}
            <Stack.Screen name="sendotp" options={{ headerShown: false }} />
            {/* verification screen full screen without the default header */}
            <Stack.Screen name="verify" options={{ headerShown: false }} />
            {/* email verification screen full screen without the default header */}
            <Stack.Screen name="emailverify" options={{ headerShown: false }} />
            {/* language screen full screen without the default header */}
            <Stack.Screen name="language" options={{ headerShown: false }} />
            {/* detailinput screen full screen without the default header */}
            <Stack.Screen name="userdetailinput" options={{ headerShown: false }} />
            {/* experience screen full screen without the default header */}
            <Stack.Screen name="experience" options={{ headerShown: false }} />
            <Stack.Screen name="response" options={{ headerShown: false }} />
            <Stack.Screen name="support" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding_one" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding_two" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding_three" options={{ headerShown: false }} />
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
            <Stack.Screen name="terms" options={{ headerShown: false }} />
            <Stack.Screen name="personality-test" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
          </Stack>
          <StatusBar style="dark" />
          <Toast config={toastConfig} />
        </ThemeProvider>
        <AppConfirmation />
        <AppActionSheet />
      </Provider>
    </GestureHandlerRootView>
  );
}
