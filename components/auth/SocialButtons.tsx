import { AppButton } from "@/components/ui/AppButton";
import { AuthLoadingModal } from "@/components/ui/AuthLoadingModal";
import { GoogleIcon } from "@/components/ui/Icons";
import { useAppleAuth } from "@/hooks/useAppleAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { normalize } from "@/utils/responsive";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface SocialButtonsProps {
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
}

export const SocialButtons = ({ style, buttonStyle }: SocialButtonsProps) => {
  const { signIn: googleSignIn, isLoading: isGoogleLoading } = useGoogleAuth();
  const {
    signIn: appleSignIn,
    isLoading: isAppleLoading,
    isAvailable: isAppleAvailable,
  } = useAppleAuth();

  const isAnyLoading = isGoogleLoading || isAppleLoading;

  return (
    <View style={[styles.container, style]}>
      {Platform.OS === "ios" && isAppleAvailable && (
        <AppButton
          title="Apple"
          variant="social"
          icon={<AntDesign name="apple" size={normalize(20)} color="#000" />}
          style={[styles.button, buttonStyle]}
          onPress={appleSignIn}
          disabled={isAnyLoading}
        />
      )}

      <AppButton
        title="Google"
        variant="social"
        icon={<GoogleIcon size={normalize(20)} />}
        style={[styles.button, buttonStyle]}
        onPress={googleSignIn}
        disabled={isAnyLoading}
      />

      <AuthLoadingModal visible={isAnyLoading} provider={isAppleLoading ? "apple" : "google"} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    marginBottom: normalize(12),
  },
});
