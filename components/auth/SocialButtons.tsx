import { AppButton } from "@/components/ui/AppButton";
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

  const handleAppleSignIn = () => {
    // Apple Sign In implementation would go here
    console.log("Apple Sign In clicked");
  };

  return (
    <View style={[styles.container, style]}>
      {Platform.OS === "ios" && (
        <AppButton
          title="Apple"
          variant="social"
          icon={<AntDesign name="apple" size={normalize(20)} color="#000" />}
          style={[styles.button, buttonStyle]}
          onPress={handleAppleSignIn}
        />
      )}

      <AppButton
        title="Google"
        variant="social"
        icon={<AntDesign name="google" size={normalize(20)} color="#DB4437" />}
        style={[styles.button, buttonStyle]}
        onPress={googleSignIn}
        disabled={isGoogleLoading}
      />
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
