import { AppButton } from "@/components/ui/AppButton";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { apiClient } from "@/utils/api";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressHeader } from "@/components/ui/ProgressHeader";
import { SUPPORT_OPTIONS } from "@/constants/StaticData";
import { hp, moderateScale, normalize } from "@/utils/responsive";

export default function SupportScreen() {
  const router = useRouter();
  const { experience, tone } = useLocalSearchParams<{ experience: string; tone: string }>();
  const [selectedSupport, setSelectedSupport] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSupport = (option: string) => {
    if (selectedSupport.includes(option)) {
      setSelectedSupport(selectedSupport.filter((s) => s !== option));
    } else {
      setSelectedSupport([...selectedSupport, option]);
    }
  };

  const handleNext = async () => {
    if (selectedSupport.length === 0) {
      toast.error("Error", "Please select at least one area where you need support");
      return;
    }

    setIsLoading(true);
    const result = await apiClient.patch(ENDPOINTS.users.me, {
      completed_step: 2,
      experience: experience || null,
      support_types: selectedSupport,
      response_styles: tone || "",
    });

    if (result.success) {
      router.replace("/onboarding_three");
    } else {
      if (result.status === 401) {
        toast.error("Session Expired", "Please login again.");
        router.replace("/");
      } else {
        toast.error("Update Failed", result.message);
      }
    }

    setIsLoading(false);
  };

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
          <ProgressHeader progress="91%" onBack={() => router.back()} />

          <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.titleText}>Where do you need {"\n"}support?</Text>
              <Text style={styles.subtitleText}>Same challenges you’re facing now</Text>
            </View>

            {/* Support Options */}
            <View style={styles.optionsContainer}>
              {SUPPORT_OPTIONS.map((option) => {
                const isSelected = selectedSupport.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.7}
                    onPress={() => toggleSupport(option)}
                    style={[styles.supportOption, isSelected && styles.supportOptionSelected]}
                  >
                    <Text style={[styles.supportText, { color: "#8A8A8E" }]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppButton
              title={isLoading ? "" : "Next"}
              style={styles.nextButton}
              onPress={handleNext}
              disabled={isLoading}
              icon={isLoading ? <ActivityIndicator color="#FFF" /> : undefined}
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
    fontSize: normalize(30), // Large title
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
  supportOption: {
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
  supportOptionSelected: {
    borderColor: "#3C61DD", // Blue border for selected state
    borderWidth: 1.5,
  },
  supportText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
  },
  nextButton: {
    // marginTop: 10,
  },
});
