import { AppButton } from "@/components/ui/AppButton";
import { ProgressHeader } from "@/components/ui/ProgressHeader";
import { LANGUAGES } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ProgressHeader progress="13%" onBack={() => BackHandler.exitApp()} />

        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titleText}>Choose your{"\n"}preferred language</Text>
            <Text style={styles.subtitleText}>Customize the app experience</Text>
          </View>

          {/* Language Options */}
          <View style={styles.optionsContainer}>
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  activeOpacity={0.7}
                  onPress={() => setSelectedLanguage(lang)}
                  style={[styles.languageOption, isSelected && styles.languageOptionSelected]}
                >
                  <Text
                    style={[
                      styles.languageText,
                      { color: "#8A8A8E" }, // In mockup all options look gray, selected has blue border
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Next Button */}
          <AppButton
            title="Next"
            style={styles.nextButton}
            onPress={() => {
              if (!selectedLanguage) {
                toast.error("Error", "Please select your preferred language");
                return;
              }
              router.push({
                pathname: "/userdetailinput",
                params: { language: selectedLanguage },
              });
            }}
          />
        </ScrollView>
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
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(28),
    paddingBottom: moderateScale(40),
  },
  header: {
    alignItems: "center",
    marginBottom: hp(5),
  },
  titleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.title,
    color: "#111111",
    textAlign: "center",
    marginBottom: hp(1.5),
  },
  subtitleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.subtitle,
    color: "#8A8A8E",
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    marginBottom: hp(2),
  },
  languageOption: {
    width: "100%",
    height: moderateScale(60), // slightly taller than standard input based on visual weight
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.65)",
    borderRadius: normalize(8),
    justifyContent: "center",
    paddingHorizontal: moderateScale(16),
    marginBottom: hp(1.5),
  },
  languageOptionSelected: {
    borderColor: "#3C61DD", // Blue border for selected state
    borderWidth: 1.5,
  },
  languageText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
  },
  nextButton: {
    // marginTop: 10,
  },
});
