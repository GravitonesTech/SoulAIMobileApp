import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
}

export const ChatBubble = ({
  role,
  text,
  onAnimationComplete,
  shouldAnimate = true,
  recommendedSound,
}: ChatBubbleProps) => {
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

  if (isUser) {
    return (
      <View style={[styles.bubbleRow, styles.bubbleRowRight]}>
        <LinearGradient
          colors={["#5A7BEF", "#24A0ED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={[styles.bubbleText, styles.userText]}>{text}</Text>
        </LinearGradient>
      </View>
    );
  }

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
            <Text style={[styles.bubbleText, styles.assistantText]}>{displayedText}</Text>
          </View>
        ) : null}
        {recommendedSound && <ChatAudioPlayer sound={recommendedSound} />}
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
});
