import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { AuthService } from "@/utils/auth";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Error", "Please enter your email.");
      return;
    }

    setIsLoading(true);
    const result = await AuthService.forgotPassword(trimmed);
    setIsLoading(false);

    if (result.success) {
      toast.success("Success", result.message);
      router.push({ pathname: "/reset-password", params: { email: trimmed } });
      return;
    }

    toast.error("Error", result.message || "Unable to process request.");
  };

  return (
    <LinearGradient colors={[Colors.gradient.start, Colors.gradient.end]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
          <View style={styles.header}>
            <Text style={styles.titleText}>Forgot Password</Text>
            <Text style={styles.subtitleText}>
              Enter your email and we’ll send you an OTP if your account is eligible.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <AppInput
              iconName="mail"
              placeholder="Email*"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={styles.inputMargin}
            />

            <AppButton
              title={isLoading ? "" : "Send OTP"}
              style={styles.primaryBtn}
              onPress={handleSendOtp}
              disabled={isLoading}
              icon={isLoading ? <ActivityIndicator color="#FFF" /> : undefined}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.backLink}
              disabled={isLoading}
            >
              <Text style={styles.backText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  titleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.title,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.subtitle,
    color: "#FFFFFF",
    opacity: 0.6,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  inputMargin: {
    marginBottom: 12,
  },
  primaryBtn: {
    marginTop: 4,
  },
  backLink: {
    marginTop: 16,
  },
  backText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
});
