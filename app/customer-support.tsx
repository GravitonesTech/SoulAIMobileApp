import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerSupportScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!subject.trim()) {
      toast.error("Validation Error", "Please enter a subject.");
      return;
    }
    if (!description.trim()) {
      toast.error("Validation Error", "Please enter a description of your issue.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call to submit ticket
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(
        "Ticket Submitted",
        "We have received your request and will get back to you shortly.",
      );
      router.back();
    } catch (err) {
      toast.error("Error", "Failed to submit support ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Feather name="arrow-left" size={normalize(24)} color="#3C61DD" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Customer Support</Text>
                <View style={styles.headerPlaceholder} />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Intro Title */}
                <Text style={styles.introTitle}>How can we help you today?</Text>
                <Text style={styles.introSubtitle}>
                  Please fill out the form below or reach out directly via our contact channels.
                </Text>

                {/* Direct Contact Cards */}
                <View style={styles.contactContainer}>
                  <View style={styles.contactCard}>
                    <Feather name="mail" size={normalize(20)} color="#3C61DD" />
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactLabel}>Email Us</Text>
                      <Text style={styles.contactValue}>support@soulai.com</Text>
                    </View>
                  </View>

                  <View style={styles.contactCard}>
                    <Feather name="phone" size={normalize(20)} color="#3C61DD" />
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactLabel}>Call Us</Text>
                      <Text style={styles.contactValue}>+1 (800) 123-4567</Text>
                    </View>
                  </View>
                </View>

                {/* Support Form */}
                <View style={styles.formContainer}>
                  <Text style={styles.formLabel}>Subject</Text>
                  <AppInput
                    placeholder="Brief summary of the issue"
                    value={subject}
                    onChangeText={setSubject}
                    iconName="info"
                    style={styles.inputMargin}
                  />

                  <Text style={styles.formLabel}>Description</Text>
                  <View style={styles.textareaContainer}>
                    <TextInput
                      placeholder="Explain your problem or question in detail..."
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={6}
                      placeholderTextColor="#8A8A8E"
                      style={styles.textarea}
                      textAlignVertical="top"
                    />
                  </View>

                  <AppButton
                    title="Submit Ticket"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    style={styles.submitButton}
                  />
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(16),
    height: normalize(56),
  },
  backButton: {
    padding: normalize(8),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(20),
    color: "#3C61DD",
    textAlign: "center",
  },
  headerPlaceholder: {
    width: normalize(40),
  },
  scrollContent: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: hp(4),
  },
  introTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(24),
    color: "#3C61DD",
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  introSubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#555555",
    lineHeight: normalize(20),
    marginBottom: hp(3),
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(4),
    gap: moderateScale(12),
  },
  contactCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.65)",
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(12),
    gap: moderateScale(10),
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#8A8A8E",
  },
  contactValue: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#3C61DD",
  },
  formContainer: {
    width: "100%",
  },
  formLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#3C61DD",
    marginBottom: hp(1),
    marginTop: hp(1.5),
  },
  inputMargin: {
    marginBottom: hp(1.5),
  },
  textareaContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.65)",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(12),
    height: normalize(150),
    marginBottom: hp(3),
  },
  textarea: {
    flex: 1,
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
    color: "#333333",
    height: "100%",
  },
  submitButton: {
    marginTop: hp(1),
  },
});
