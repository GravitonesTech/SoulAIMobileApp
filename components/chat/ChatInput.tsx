import { Colors } from "@/constants/theme";
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
}

export const ChatInput = ({
  value,
  onChangeText,
  onSend,
  placeholder = "Ask me anything...",
}: ChatInputProps) => {
  return (
    <View style={styles.bottomBarContainer}>
      <View style={styles.bottomBar}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#A0A0A0"
            style={styles.input}
            onSubmitEditing={onSend}
            returnKeyType="send"
          />
        </View>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="mic" size={normalize(24)} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={onSend}>
          <Ionicons name="paper-plane-outline" size={normalize(24)} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBarContainer: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(12),
    marginTop: normalize(6),
    marginBottom: normalize(4),
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(4),
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.brand.inputBackground,
    height: normalize(50),
    borderRadius: normalize(25),
    justifyContent: "center",
    paddingHorizontal: normalize(20),
  },
  input: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
    color: "#333",
  },
  iconButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    alignItems: "center",
    justifyContent: "center",
  },
});
