import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState("");

  // ✅ Validation Function
  const handleLogin = () => {
    const phoneRegex = /^[0-9]{10}$/;

    if (!phone.trim()) {
      toast.error("Error", "Please enter your phone number.");
      return;
    }

    if (!phoneRegex.test(phone)) {
      toast.error("Invalid Phone Number", "Please enter a valid 10-digit phone number");
      return;
    }

    // ✅ If valid → proceed
    router.push("/verify");
  };

  return (
    <LinearGradient colors={[Colors.gradient.start, Colors.gradient.end]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.titleText}>Soul AI</Text>
              <Text style={styles.subtitleText}>Log in to your Soul AI account</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <AppInput
                iconName="phone"
                placeholder="Phone Number*"
                keyboardType="number-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={10}
                style={styles.inputMargin}
              />

              <AppButton title="Continue" style={styles.signInBtnMargin} onPress={handleLogin} />
            </View>

            {/* Bottom Link */}
            <View style={styles.bottomLinkContainer}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/signup")}>
                <Text style={styles.bottomLinkText}>Don’t have an account? Create one</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: moderateScale(28),
    paddingTop: moderateScale(48),
    paddingBottom: moderateScale(12),
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginTop: hp(6),
    marginBottom: hp(12.5),
  },
  titleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(Typography.sizes.title),
    color: "#FFFFFF",
    marginBottom: hp(1),
  },
  subtitleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(Typography.sizes.subtitle),
    color: "#FFFFFF",
    opacity: 0.6,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  inputMargin: {
    marginBottom: hp(1.5),
  },
  signInBtnMargin: {
    marginTop: hp(0.5),
  },
  bottomLinkContainer: {
    marginTop: hp(4),
    alignItems: "center",
  },
  bottomLinkText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
});
