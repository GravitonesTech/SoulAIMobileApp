import { AppButton } from "@/components/ui/AppButton";
import { ProgressHeader } from "@/components/ui/ProgressHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function ExperienceScreen() {
  const router = useRouter();
  const [selectedExperience, setSelectedExperience] = useState<{ id: number; name: string } | null>(null);
  const [experienceLevels, setExperienceLevels] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.users.metadata);
        if (response.success && response.data?.experiences) {
          setExperienceLevels(response.data.experiences);
        }
      } catch (error) {
        console.error("[ExperienceScreen] Failed to fetch metadata experiences:", error);
      }
    };
    fetchMetadata();
  }, []);

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ProgressHeader progress="65%" onBack={() => router.back()} />

          <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.titleText}>Your Experience with {"\n"}Therapy?</Text>
              <Text style={styles.subtitleText}>Let us know more about you</Text>
            </View>

            {/* Experience Options */}
            <View style={styles.optionsContainer}>
              {experienceLevels.map((level) => {
                const isSelected = selectedExperience?.id === level.id;
                return (
                  <TouchableOpacity
                    key={level.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedExperience(level)}
                    style={[styles.languageOption, isSelected && styles.languageOptionSelected]}
                  >
                    <Text style={[styles.languageText, { color: "#8A8A8E" }]}>{level.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppButton
              title="Next"
              style={styles.nextButton}
              onPress={() => {
                if (!selectedExperience) {
                  toast.error("Error", "Please select your experience level");
                  return;
                }
                router.push({
                  pathname: "/response",
                  params: { experience_id: selectedExperience.id },
                } as any);
              }}
            />
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
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(28),
    paddingBottom: hp(5),
  },
  header: {
    alignItems: "center",
    marginBottom: hp(5),
  },
  titleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(32), // Large title
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
