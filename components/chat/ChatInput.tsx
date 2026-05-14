import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput = ({
  value,
  onChangeText,
  onSend,
  placeholder = "Ask me anything...",
  disabled = false,
}: ChatInputProps) => {
  return (
    <View style={styles.bottomBarContainer}>
      <View style={styles.bottomBar}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#8E8E93"
            style={styles.input}
            onSubmitEditing={!disabled ? onSend : undefined}
            returnKeyType="send"
            editable={true}
          />
        </View>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} disabled={disabled}>
          <Feather name="mic" size={normalize(26)} color={disabled ? "#A0A0A0" : "#1C1C1E"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onSend}
          disabled={disabled}
        >
          <Ionicons
            name="paper-plane-outline"
            size={normalize(26)}
            color={disabled ? "#A0A0A0" : "#1C1C1E"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBarContainer: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(20),
    paddingTop: normalize(8),
    backgroundColor: "transparent",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(6),
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#D9E3F0", // Adjusted to match the light blue-gray tone in the image
    height: normalize(48),
    borderRadius: normalize(24),
    justifyContent: "center",
    paddingHorizontal: normalize(18),
  },
  input: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(15),
    color: "#1C1C1E",
  },
  iconButton: {
    width: normalize(40),
    height: normalize(40),
    alignItems: "center",
    justifyContent: "center",
  },
});
