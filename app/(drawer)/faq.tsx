import { AppHeader } from "@/components/ui/AppHeader";
import { FAQ_DATA } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function FAQScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({
      type: "success",
      text1: "Copied to clipboard",
      position: "bottom",
    });
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Header */}
        <AppHeader leftIcon="arrow-left" title="FAQ" />

        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {FAQ_DATA.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <Animated.View layout={LinearTransition} key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.questionRow}
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                  <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={normalize(20)}
                    color="#8A8A8E"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.answerContainer}
                  >
                    {item.isPromptList ? (
                      <View style={styles.promptListContainer}>
                        {item.answer.split("\n").map((prompt, pIndex) => {
                          const cleanText = prompt.replace(/^\d+\.\s*/, "");
                          return (
                            <View key={pIndex} style={styles.promptRow}>
                              <Text style={[styles.answerText, { flex: 1 }]}>{prompt}</Text>
                              <TouchableOpacity
                                onPress={() => copyToClipboard(cleanText)}
                                style={styles.inlineCopyButton}
                                activeOpacity={0.8}
                              >
                                <Feather name="copy" size={normalize(14)} color="#3C61DD" />
                                <Text style={styles.inlineCopyButtonText}>Copy</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={styles.answerText}>{item.answer}</Text>
                    )}
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
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
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(40),
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: moderateScale(24),
  },
  questionText: {
    flex: 1,
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#111111",
    lineHeight: normalize(22),
    paddingRight: moderateScale(20),
  },
  answerContainer: {
    paddingBottom: moderateScale(24),
    paddingTop: moderateScale(4),
  },
  answerText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#8A8A8E",
    lineHeight: normalize(22),
  },
  copyButton: {
    alignSelf: "flex-end",
    marginTop: moderateScale(10),
    padding: moderateScale(4),
  },
  copyButtonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#3C61DD",
  },
  promptListContainer: {
    gap: moderateScale(12),
    marginTop: moderateScale(4),
  },
  promptRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2F9FF",
    padding: moderateScale(12),
    borderRadius: normalize(10),
    gap: moderateScale(10),
  },
  inlineCopyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: "#E2F4FF",
    gap: moderateScale(4),
  },
  inlineCopyButtonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#3C61DD",
  },
});
