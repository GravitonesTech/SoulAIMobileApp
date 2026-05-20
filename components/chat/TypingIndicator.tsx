import { normalize } from "@/utils/responsive";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dotValue: Animated.Value, leadDelay: number, tailDelay: number) => {
      const sequenceArr = [];
      if (leadDelay > 0) {
        sequenceArr.push(Animated.delay(leadDelay));
      }
      sequenceArr.push(
        Animated.timing(dotValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      );
      sequenceArr.push(
        Animated.timing(dotValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      );
      if (tailDelay > 0) {
        sequenceArr.push(Animated.delay(tailDelay));
      }
      return Animated.loop(Animated.sequence(sequenceArr));
    };

    const anim1 = animateDot(dot1, 0, 600);
    const anim2 = animateDot(dot2, 150, 450);
    const anim3 = animateDot(dot3, 300, 300);

    Animated.parallel([anim1, anim2, anim3]).start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const getStyle = (dotValue: Animated.Value) => {
    return {
      transform: [
        {
          translateY: dotValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -6],
          }),
        },
      ],
      opacity: dotValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 1],
      }),
    };
  };

  return (
    <View style={[styles.bubbleRow, styles.bubbleRowLeft]}>
      <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
        <View style={styles.typingContainer}>
          <Animated.View style={[styles.typingDot, getStyle(dot1)]} />
          <Animated.View style={[styles.typingDot, getStyle(dot2)]} />
          <Animated.View style={[styles.typingDot, getStyle(dot3)]} />
        </View>
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
  bubble: {
    maxWidth: "86%",
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12),
    borderRadius: normalize(14),
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
  typingBubble: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    minWidth: normalize(56),
    alignSelf: "flex-start",
    marginBottom: normalize(10),
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normalize(4),
    height: normalize(14),
  },
  typingDot: {
    width: normalize(7),
    height: normalize(7),
    borderRadius: normalize(3.5),
    backgroundColor: "#3C61DD",
  },
});
