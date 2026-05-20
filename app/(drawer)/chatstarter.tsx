import { ChatInput } from "@/components/chat/ChatInput";
import { AppHeader } from "@/components/ui/AppHeader";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility";
import { useAppSelector } from "@/store/hooks";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
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

import { ENDPOINTS } from "@/constants/endpoints";
import { CHAT_PROMPTS, THERAPY_COLORS } from "@/constants/StaticData";
import { Therapy } from "@/types/therapy";
import { apiClient } from "@/utils/api";
import { AuthService } from "@/utils/auth";

export default function ChatStarterScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [inputText, setInputText] = useState("");
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [isLoadingTherapies, setIsLoadingTherapies] = useState(true);
  const isKeyboardVisible = useKeyboardVisibility();

  const displayName = user?.full_name?.split(" ")[0] || "User";

  const navigation = useNavigation<any>();

  React.useEffect(() => {
    AuthService.checkAuth();
    fetchTherapies();
  }, []);

  const fetchTherapies = async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.master.therapies);
      if (response.success && response.data) {
        setTherapies(response.data);
      }
    } catch (error) {
      console.error("[ChatStarter] Error fetching therapies:", error);
    } finally {
      setIsLoadingTherapies(false);
    }
  };

  const openMoreOptions = () => {
    navigation.openDrawer();
  };

  const handleSend = () => {
    if (inputText.trim()) {
      router.push({
        pathname: "/chat",
        params: {
          initialMessage: inputText.trim(),
          sessionId: Date.now().toString(),
        },
      } as any);
      setInputText("");
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === "ios" ? "padding" : isKeyboardVisible ? "height" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          {/* Main Content Area */}
          <View style={styles.flex1}>
            <AppHeader onLeftPress={openMoreOptions} />

            <ScrollView
              style={styles.flex1}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
              keyboardShouldPersistTaps="handled"
            >
              {/* Greeting Header */}
              <View style={styles.header}>
                <Text style={styles.greetingText}>
                  Hello {displayName}, How{"\n"}can I help you?
                </Text>
                <Text style={styles.updateText}>Last Update: 22.04.26</Text>
              </View>

              {/* Therapy Type Buttons */}
              <View style={styles.therapyList}>
                {isLoadingTherapies ? (
                  <View style={{ paddingVertical: 20 }}>
                    <Text style={styles.updateText}>Loading therapies...</Text>
                  </View>
                ) : (
                  therapies.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        router.push({
                          pathname: "/chat",
                          params: {
                            therapy: item.name,
                            sessionId: Date.now().toString(),
                            selected_therapy: item.short_name,
                          },
                        } as any);
                      }}
                      style={[
                        styles.therapyButton,
                        { backgroundColor: THERAPY_COLORS[index % THERAPY_COLORS.length] },
                      ]}
                    >
                      <Text style={styles.therapyButtonText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Chat Prompts */}
              <View style={styles.promptsContainer}>
                {CHAT_PROMPTS.map((prompt, index) => (
                  <TouchableOpacity key={index} style={styles.promptCard} activeOpacity={0.7}>
                    <View style={styles.dot} />
                    <Text style={styles.promptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Input Bar */}
            <ChatInput value={inputText} onChangeText={setInputText} onSend={handleSend} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(32),
  },
  header: {
    alignItems: "center",
    marginTop: hp(2),
    marginBottom: hp(4),
  },
  greetingText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(32),
    color: "#000000",
    textAlign: "center",
    lineHeight: normalize(42),
  },
  updateText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#464646",
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  therapyList: {
    alignItems: "center",
  },
  therapyButton: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    borderRadius: normalize(25),
    marginBottom: hp(1),
    // width: wp(90),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  therapyButtonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#FFF",
    textAlign: "center",
  },
  promptsContainer: {
    marginBottom: hp(2),
    alignItems: "center",
    marginTop: hp(4),
  },
  promptCard: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.brand.cardBackground,
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(20),
    borderRadius: normalize(30),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 0.5,
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: normalize(4),
    backgroundColor: Colors.brand.dotGreen,
    marginRight: wp(3),
  },
  promptText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#000000",
  },
});
