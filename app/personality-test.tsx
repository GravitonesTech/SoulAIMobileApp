import { AppButton } from "@/components/ui/AppButton";
import {
  ASSESSMENT_OPTIONS,
  ASSESSMENT_QUESTIONS,
  DIFFICULTY_OPTIONS,
} from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { moderateScale, normalize, hp, wp } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonalityTestScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const currentQuestion = ASSESSMENT_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (answers[currentQuestion.id] === undefined) {
      toast.error("Selection Required", "Please select an option to continue");
      return;
    }

    if (currentIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Test complete - could navigate to results or show a summary
      router.back();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.back();
    }
  };

  const options = currentQuestion.type === "difficulty" ? DIFFICULTY_OPTIONS : ASSESSMENT_OPTIONS;

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation & Progress */}
        <View style={styles.topNavContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Feather name="arrow-left" size={normalize(24)} color="#111111" />
          </TouchableOpacity>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Indicator */}
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{currentQuestion.section}</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titleText}>{currentQuestion.question}</Text>
            <Text style={styles.subtitleText}>{currentQuestion.subtitle}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(option.value)}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  {currentQuestion.type === "rating" && (
                    <Text style={[styles.optionValue, isSelected && styles.optionValueSelected]}>
                      {option.value}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <AppButton
            title={currentIndex === ASSESSMENT_QUESTIONS.length - 1 ? "Finish" : "Next"}
            style={styles.nextButton}
            onPress={handleNext}
          />

          <View style={styles.whoFooter}>
            <View style={styles.whoDivider} />
            <Text style={styles.whoFooterText}>
              Assessment questions are based on standardized clinical scales (PHQ-9 and GAD-7) as
              recommended by the{"\n"}
              <Text style={styles.whoHighlight}>WORLD HEALTH ORGANIZATION</Text>
            </Text>
          </View>
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
  topNavContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(24),
  },
  backButton: {
    padding: moderateScale(4),
    marginRight: wp(4),
  },
  progressTrack: {
    flex: 1,
    height: normalize(4),
    backgroundColor: "rgba(60, 97, 221, 0.1)",
    borderRadius: normalize(2),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3C61DD",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(40),
  },
  sectionBadge: {
    alignSelf: "center",
    backgroundColor: "rgba(60, 97, 221, 0.1)",
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: normalize(12),
    marginBottom: hp(2),
    marginTop: hp(1.2),
  },
  sectionBadgeText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#3C61DD",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: hp(4),
  },
  titleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(26),
    color: "#111111",
    textAlign: "center",
    marginBottom: hp(1.5),
    lineHeight: normalize(34),
  },
  subtitleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
    color: "#666666",
    textAlign: "center",
    lineHeight: normalize(22),
  },
  optionsContainer: {
    width: "100%",
    marginBottom: hp(3.5),
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: moderateScale(64),
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(12),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: normalize(4),
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: "#3C61DD",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  optionLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(17),
    color: "#464646",
    flex: 1,
  },
  optionLabelSelected: {
    color: "#3C61DD",
  },
  optionValue: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(17),
    color: "#8E8E93",
    marginLeft: wp(3),
  },
  optionValueSelected: {
    color: "#3C61DD",
  },
  nextButton: {
    marginTop: "auto",
  },
  whoFooter: {
    marginTop: hp(4),
    alignItems: "center",
  },
  whoDivider: {
    width: "40%",
    height: normalize(1),
    backgroundColor: "rgba(60, 97, 221, 0.15)",
    marginBottom: hp(2),
  },
  whoFooterText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: normalize(18),
    opacity: 0.8,
  },
  whoHighlight: {
    fontFamily: Typography.fonts.medium,
    color: "#3C61DD",
    fontSize: normalize(10),
  },
});
