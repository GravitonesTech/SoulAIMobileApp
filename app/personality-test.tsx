import { AssessmentEmpty } from "@/components/personality-test/AssessmentEmpty";
import { AssessmentFooter } from "@/components/personality-test/AssessmentFooter";
import { AssessmentLoading } from "@/components/personality-test/AssessmentLoading";
import { OptionCard } from "@/components/personality-test/OptionCard";
import { AppButton } from "@/components/ui/AppButton";
import { ProgressHeader } from "@/components/ui/ProgressHeader";
import { Typography } from "@/constants/Typography";
import { ENDPOINTS } from "@/constants/endpoints";
import { useAppConfirmation } from "@/hooks/useAppConfirmation";
import { Question } from "@/types/assessment";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonalityTestScreen() {
  const router = useRouter();
  const { showConfirmation } = useAppConfirmation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const showExitAlert = useCallback(() => {
    showConfirmation(
      "Discard Progress?",
      "Your assessment answers are not saved. Are you sure you want to quit?",
      () => router.back(),
      {
        cancelLabel: "Cancel",
        confirmLabel: "Quit",
      },
    );
  }, [router, showConfirmation]);
  useEffect(() => {
    const backAction = () => {
      if (isLoading || questions.length === 0) {
        router.back();
        return true;
      }
      showExitAlert();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [isLoading, questions.length, router, showExitAlert]);

  const fetchQuestions = async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.master.assessmentForms);
      if (response.success && response.data) {
        const allQuestions: Question[] = [];
        response.data.forEach((form: any) => {
          form.questions.forEach((q: any) => {
            allQuestions.push({
              id: q.id,
              form_id: q.form_id,
              form_code: form.code || form.name,
              question_text: q.question_text,
              order: q.order,
              section: form.name,
              subtitle: form.description,
              options: q.options,
            });
          });
        });
        setQuestions(allQuestions);
      } else {
        toast.error("Failed to load assessments", response.message || "Something went wrong");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error", "Could not connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const submitAssessments = async () => {
    setIsSubmitting(true);
    try {
      // Group answers by form
      const groupedSubmissions: Record<
        number,
        {
          form_id: number;
          form_code: string;
          answers: { question_id: number; selected_option_id: number }[];
        }
      > = {};

      questions.forEach((q) => {
        const selectedOptionId = answers[q.id];
        if (selectedOptionId !== undefined) {
          if (!groupedSubmissions[q.form_id]) {
            groupedSubmissions[q.form_id] = {
              form_id: q.form_id,
              form_code: q.form_code,
              answers: [],
            };
          }
          groupedSubmissions[q.form_id].answers.push({
            question_id: q.id,
            selected_option_id: selectedOptionId,
          });
        }
      });

      const payload = Object.values(groupedSubmissions);

      const response = await apiClient.post(ENDPOINTS.users.assessmentSubmissionsBulk, payload);

      if (response.success) {
        toast.success("Success", "Assessments submitted successfully");
        router.replace("/chatstarter");
      } else {
        toast.error("Submission Failed", response.message || "Failed to submit assessments");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error", "Could not submit assessment answers");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleSelect = (optionId: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    if (answers[currentQuestion.id] === undefined) {
      toast.error("Selection Required", "Please select an option to continue");
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await submitAssessments();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      showExitAlert();
    }
  };

  if (isLoading) {
    return <AssessmentLoading />;
  }

  if (isSubmitting) {
    return <AssessmentLoading message="Submitting answers..." />;
  }

  if (questions.length === 0) {
    return <AssessmentEmpty onBack={() => router.back()} />;
  }

  const options = currentQuestion?.options || [];

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ProgressHeader progress={progress} onBack={handleBack} />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Indicator */}
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{currentQuestion?.section}</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titleText}>{currentQuestion?.question_text}</Text>
            <Text style={styles.subtitleText}>{currentQuestion?.subtitle}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={answers[currentQuestion.id] === option.id}
                onSelect={handleSelect}
              />
            ))}
          </View>

          <AssessmentFooter />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <AppButton
            title={currentIndex === questions.length - 1 ? "Finish" : "Next"}
            onPress={handleNext}
          />
        </View>
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
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(20),
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
    marginBottom: hp(0.5),
  },
  bottomContainer: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(24),
    marginTop: hp(1.5),
  },
});
