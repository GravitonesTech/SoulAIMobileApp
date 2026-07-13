import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChatAudioPlayer } from "./ChatAudioPlayer";

type RecommendedSound = {
  id: number;
  sound: string;
  short_name: string;
  description: string;
  image: string;
};

interface ChatBubbleProps {
  role: "user" | "assistant";
  text: string;
  onAnimationComplete?: () => void;
  shouldAnimate?: boolean;
  recommendedSound?: RecommendedSound | null;
  isHuman?: boolean;
  sessionId?: string;
  therapy?: string;
  selected_therapy?: string;
  showNewChatButton?: string;
  senderName?: string;
}

export const ChatBubble = ({
  role,
  text,
  onAnimationComplete,
  shouldAnimate = true,
  recommendedSound,
  isHuman,
  sessionId,
  therapy,
  selected_therapy,
  showNewChatButton,
  senderName,
}: ChatBubbleProps) => {
  const router = useRouter();
  const isUser = role === "user";
  const [displayedText, setDisplayedText] = useState(isUser || !shouldAnimate ? text : "");

  useEffect(() => {
    if (isUser || !shouldAnimate) {
      setDisplayedText(text);
      if (onAnimationComplete) onAnimationComplete();
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        if (onAnimationComplete) onAnimationComplete();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isUser, text, shouldAnimate]);

  const renderFormattedText = (textStr: string) => {
    if (!textStr) return null;
    const parts = textStr.split("**");
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <Text key={index} style={{ fontFamily: Typography.fonts.bold }}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  if (isUser) {
    return (
      <View style={[styles.bubbleRow, styles.bubbleRowRight]}>
        <LinearGradient
          colors={["#5A7BEF", "#24A0ED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={[styles.bubbleText, styles.userText]}>{renderFormattedText(text)}</Text>
        </LinearGradient>
      </View>
    );
  }

  const isAI = senderName === "Soul AI";

  return (
    <View style={[styles.bubbleRow, styles.bubbleRowLeft]}>
      <View style={{ flexDirection: "column", maxWidth: "86%" }}>
        {text ? (
          <View
            style={[
              styles.bubble,
              styles.assistantBubble,
              { maxWidth: "100%", marginBottom: recommendedSound ? normalize(8) : 0 },
            ]}
          >
            {senderName && (
              <View style={styles.senderContainerInside}>
                <Text style={[styles.senderNameInside, isAI && styles.senderNameAIInside]}>
                  {senderName}
                </Text>
              </View>
            )}
            <Text style={[styles.bubbleText, styles.assistantText]}>
              {renderFormattedText(displayedText)}
            </Text>
          </View>
        ) : null}
        {recommendedSound && (
          <ChatAudioPlayer
            sound={recommendedSound}
            sessionId={sessionId}
            therapy={therapy}
            selected_therapy={selected_therapy}
            showNewChatButton={showNewChatButton}
          />
        )}
        {isHuman && (
          <TouchableOpacity
            onPress={() => router.push("/human-therapists")}
            activeOpacity={0.8}
            style={styles.humanLinkWrapper}
          >
            <LinearGradient
              colors={["#3BC0EB", "#5858E8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.humanLinkGradient}
            >
              <Feather
                name="user"
                size={normalize(16)}
                color="#FFFFFF"
                style={styles.humanLinkIcon}
              />
              <Text style={styles.humanLinkText}>Connect with a human therapist</Text>
              <Feather
                name="arrow-right"
                size={normalize(14)}
                color="#FFFFFF"
                style={styles.humanLinkArrow}
              />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleRow: {
    flexDirection: "row",
    marginBottom: normalize(10),
  },
  bubbleRowLeft: {
    justifyContent: "flex-start",
  },
  bubbleRowRight: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "86%",
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12),
    borderRadius: normalize(14),
  },
  userBubble: {
    borderTopRightRadius: normalize(6),
  },
  assistantBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: normalize(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  bubbleText: {
    fontSize: normalize(14),
    lineHeight: normalize(22),
  },
  userText: {
    fontFamily: Typography.fonts.medium,
    color: "#FFFFFF",
  },
  assistantText: {
    fontFamily: Typography.fonts.regular,
    color: "#1C1C1E",
  },
  humanLinkWrapper: {
    alignSelf: "flex-start",
    marginTop: normalize(8),
    shadowColor: "#5858E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  humanLinkGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: normalize(20),
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(16),
  },
  humanLinkIcon: {
    marginRight: normalize(8),
  },
  humanLinkText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(13),
    color: "#FFFFFF",
  },
  humanLinkArrow: {
    marginLeft: normalize(6),
  },
  senderContainerInside: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(4),
  },
  senderNameInside: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#5A7BEF",
  },
  senderNameAIInside: {
    color: "#3C61DD",
  },
});
