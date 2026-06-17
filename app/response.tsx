import { AppButton } from "@/components/ui/AppButton";
import { AppHeader } from "@/components/ui/AppHeader";
import { ProgressHeader } from "@/components/ui/ProgressHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function ResponseScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { experience_id, from } = useLocalSearchParams<{ experience_id: string; from: string }>();
  const user = useAppSelector((state) => state.auth.user);

  const [selectedTone, setSelectedTone] = useState<{ id: number; name: string } | null>(() => {
    if (
      from === "profile" &&
      Array.isArray(user?.response_styles) &&
      user.response_styles.length > 0
    ) {
      return user.response_styles[0];
    }
    return null;
  });
  const [toneOptions, setToneOptions] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.users.metadata);
        if (response.success && response.data?.response_styles) {
          setToneOptions(response.data.response_styles);
        }
      } catch (error) {
        console.error("[ResponseScreen] Failed to fetch metadata response_styles:", error);
      }
    };
    fetchMetadata();
  }, []);

  const handleNext = async () => {
    if (!selectedTone) {
      toast.error("Error", "Please select your preferred response tone");
      return;
    }

    if (from === "profile") {
      setIsLoading(true);
      try {
        const result = await apiClient.patch(ENDPOINTS.users.me, {
          response_style_ids: [selectedTone.id],
        });
        if (result.success && result.data) {
          dispatch(updateUser(result.data));
          toast.success("Success", "Therapy style updated successfully!");
          router.back();
        } else {
          toast.error("Update Failed", result.message || "Failed to update response style");
        }
      } catch (error) {
        console.error("[ResponseScreen] Error saving response style:", error);
        toast.error("Error", "A network error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      router.push({
        pathname: "/support",
        params: { experience_id, tone_id: selectedTone.id },
      } as any);
    }
  };

  return (
    <LinearGradient
      // Approximating the radial gradient from the CSS
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
          {from === "profile" ? (
            <AppHeader
              leftIcon="arrow-left"
              // showAvatar={false}
              title="Therapy Style"
              onLeftPress={() => router.back()}
            />
          ) : (
            <ProgressHeader progress="78%" onBack={() => router.back()} />
          )}

          <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.titleText}>How should I respond{"\n"}to you?</Text>
              <Text style={styles.subtitleText}>Choose your preferred tone</Text>
            </View>

            {/* Tone Options */}
            <View style={styles.optionsContainer}>
              {toneOptions.map((tone) => {
                const isSelected = selectedTone?.id === tone.id;
                return (
                  <TouchableOpacity
                    key={tone.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedTone(tone)}
                    style={[styles.languageOption, isSelected && styles.languageOptionSelected]}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        isSelected ? { color: "#8A8A8E" } : { color: "#8A8A8E" },
                      ]}
                    >
                      {tone.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppButton
              title={isLoading ? "" : from === "profile" ? "Save" : "Next"}
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
    paddingBottom: moderateScale(40),
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
    fontSize: normalize(Typography.sizes.subtitle),
    color: "#8A8A8E",
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    marginBottom: hp(2),
  },
  languageOption: {
    width: "100%",
    height: 60, // slightly taller than standard input based on visual weight
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
