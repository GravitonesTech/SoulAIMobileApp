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
          <Feather name="mic" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={onSend}>
          <Ionicons name="paper-plane-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.brand.inputBackground,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  input: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
    color: "#333",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
