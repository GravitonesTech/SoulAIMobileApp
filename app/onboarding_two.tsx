import { AppButton } from "@/components/ui/AppButton";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingTwoScreen() {
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, []);

  return (
    <LinearGradient
      colors={["#3BC0EB", "#5858E8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Every Person is Unique</Text>
              <Text style={styles.subtitle}>Personalized your therapy{"\n"}Experience</Text>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomContainer}>
              <AppButton
                title="Customize Soul AI"
                onPress={() => router.push("/experience")}
                style={styles.button}
              />

              <Text style={styles.footerText}>
                All the data shared with Soul AI is protected and secured only within the
                application.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? normalize(40) : 0,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: moderateScale(30),
    paddingBottom: moderateScale(40),
  },
  headerContainer: {
    alignItems: "center",
    marginTop: hp(18),
  },
  title: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(32),
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: hp(2),
  },
  subtitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: normalize(22),
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    gap: normalize(30),
    marginBottom: hp(2.5),
    marginTop: hp(17),
  },
  button: {
    width: "100%",
    backgroundColor: "#3C61DD",
    borderRadius: normalize(12),
    height: normalize(56),
  },
  footerText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: normalize(18),
    paddingHorizontal: moderateScale(20),
    opacity: 0.9,
  },
});
