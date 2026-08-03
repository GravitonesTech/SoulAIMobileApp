import { AppButton } from "@/components/ui/AppButton";
import { AppHeader } from "@/components/ui/AppHeader";
import { ProgressHeader } from "@/components/ui/ProgressHeader";
import { EntryAnimations } from "@/constants/Animations";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { useFadeTransition } from "@/hooks/useFadeTransition";
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
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupportScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { experience_id, tone_id, from } = useLocalSearchParams<{
    experience_id: string;
    tone_id: string;
    from: string;
  }>();
  const user = useAppSelector((state) => state.auth.user);
  const { animatedStyle, navigateWithFade, goBackWithFade } = useFadeTransition(200);

  const userSupportTypeIds =
    Array.isArray(user?.support_types) && user.support_types.length > 0
      ? user.support_types.map((s: any) => s.id)
      : [];

  const [selectedSupportIds, setSelectedSupportIds] = useState<number[]>(() => {
    if (from === "profile") {
      return userSupportTypeIds;
    }
    return [];
  });
  const [supportOptions, setSupportOptions] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.users.metadata);
        if (response.success && response.data?.support_types) {
          setSupportOptions(response.data.support_types);
        }
      } catch (error) {
        console.error("[SupportScreen] Failed to fetch metadata support_types:", error);
      }
    };
    fetchMetadata();
  }, []);

  const toggleSupport = (id: number) => {
    const numId = Number(id);
    if (selectedSupportIds.includes(numId)) {
      setSelectedSupportIds(selectedSupportIds.filter((s) => s !== numId));
    } else {
      setSelectedSupportIds([...selectedSupportIds, numId]);
    }
  };

  const handleNext = async () => {
    if (selectedSupportIds.length === 0) {
      toast.error("Error", "Please select at least one area where you need support");
      return;
    }

    setIsLoading(true);

    if (from === "profile") {
      try {
        const result = await apiClient.patch(ENDPOINTS.users.me, {
          support_type_ids: selectedSupportIds,
        });
        if (result.success && result.data) {
          dispatch(updateUser(result.data));
          toast.success("Success", "Support areas updated successfully!");
          goBackWithFade();
        } else {
          toast.error("Update Failed", result.message || "Failed to update support areas");
        }
      } catch (error) {
        console.error("[SupportScreen] Error saving support types:", error);
        toast.error("Error", "A network error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const result = await apiClient.patch(ENDPOINTS.users.me, {
      completed_step: 2,
      experience_id: experience_id ? Number(experience_id) : null,
      support_type_ids: selectedSupportIds,
      response_style_ids: tone_id ? [Number(tone_id)] : [],
    });

    if (result.success) {
      navigateWithFade("/onboarding_three", { replace: true });
    } else {
      if (result.status === 401) {
        toast.error("Session Expired", "Please login again.");
        navigateWithFade("/", { replace: true });
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
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {from === "profile" ? (
              <AppHeader
                leftIcon="arrow-left"
                // showAvatar={false}
                title="Support Needed"
                onLeftPress={() => router.back()}
              />
            ) : (
              <ProgressHeader progress="91%" onBack={() => router.back()} />
            )}

            <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
              {/* Header */}
              <Animated.View entering={EntryAnimations.header} style={styles.header}>
                <Text style={styles.titleText}>Where do you need {"\n"}support?</Text>
                <Text style={styles.subtitleText}>Same challenges you’re facing now</Text>
              </Animated.View>

              {/* Support Options & Next Button */}
              {supportOptions.length > 0 ? (
                <Animated.View entering={EntryAnimations.formContainer} style={{ width: "100%" }}>
                  <View style={styles.optionsContainer}>
                    {supportOptions.map((option) => {
                      const isSelected = selectedSupportIds.includes(Number(option.id));
                      return (
                        <TouchableOpacity
                          key={option.id}
                          activeOpacity={0.7}
                          onPress={() => toggleSupport(option.id)}
                          style={[styles.supportOption, isSelected && styles.supportOptionSelected]}
                        >
                          <Text style={[styles.supportText, { color: "#8A8A8E" }]}>
                            {option.name}
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
                </Animated.View>
              ) : (
                <ActivityIndicator size="large" color="#3C61DD" style={{ marginTop: hp(10) }} />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
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
