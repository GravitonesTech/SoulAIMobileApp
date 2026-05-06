import { FAQ_DATA } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FAQScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
          <TouchableOpacity onPress={() => {}} style={styles.avatarButton}>
            <View style={styles.avatarContainer}>
              <Image source={require("@/assets/images/avatar.png")} style={styles.avatar} />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {FAQ_DATA.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.questionRow}
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                  <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#8A8A8E"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                    {/* {item.isPromptList && ( */}
                    <TouchableOpacity
                      onPress={() => copyToClipboard(item.answer)}
                      style={styles.copyButton}
                    >
                      <Text style={styles.copyButtonText}>copy</Text>
                    </TouchableOpacity>
                    {/* )} */}
                  </View>
                )}
              </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: 22,
    color: "#111111",
  },
  avatarButton: {
    padding: 2,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1E5FF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 24,
  },
  questionText: {
    flex: 1,
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
    color: "#111111",
    lineHeight: 22,
    paddingRight: 20,
  },
  answerContainer: {
    paddingBottom: 24,
    paddingTop: 4,
  },
  answerText: {
    fontFamily: Typography.fonts.regular,
    fontSize: 14,
    color: "#8A8A8E",
    lineHeight: 22,
  },
  copyButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    padding: 4,
  },
  copyButtonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: "#3C61DD",
  },
});
