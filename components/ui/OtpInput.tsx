import { normalize } from "@/utils/responsive";
import React, { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export interface OtpInputProps {
  length?: number;
  onChange?: (otp: string) => void;
}

export const OtpInput = ({ length = 4, onChange }: OtpInputProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const sanitized = text.replace(/[^0-9]/g, "");
    if (sanitized.length === 0) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      onChange?.(newOtp.join(""));
      return;
    }

    const newOtp = [...otp];
    if (sanitized.length > 1) {
      const oldValue = otp[index];
      const isSingleDigitTypeOver =
        sanitized.length === 2 && (sanitized.startsWith(oldValue) || sanitized.endsWith(oldValue));

      if (isSingleDigitTypeOver) {
        const newDigit = sanitized.startsWith(oldValue)
          ? sanitized.slice(1)
          : sanitized.slice(0, 1);
        newOtp[index] = newDigit;
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      } else {
        const startIndex = sanitized.length === length ? 0 : index;
        for (let i = 0; i < length - startIndex; i++) {
          if (i < sanitized.length) {
            newOtp[startIndex + i] = sanitized[i];
          }
        }
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
        const focusIndex = Math.min(startIndex + sanitized.length - 1, length - 1);
        inputRefs.current[focusIndex]?.focus();
      }
    } else {
      newOtp[index] = sanitized;
      setOtp(newOtp);
      onChange?.(newOtp.join(""));

      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index]) {
        // If current box has a value, clear it and move back
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else if (index > 0) {
        // If current box is already empty, move back and clear previous
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <View key={index} style={styles.box}>
            <TextInput
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={styles.input}
              maxLength={length}
              keyboardType="number-pad"
              // placeholder=""
              placeholderTextColor="#8A8A8E"
              value={otp[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          </View>
        ))}
    </View>
  );
};

const BOX_SIZE = normalize(64);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // slightly whiter than normal input
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.65)",
    borderRadius: normalize(8),
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    fontSize: normalize(24),
    textAlign: "center",
    textAlignVertical: "center",
    color: "#333333",
    width: "100%",
    height: "100%",
    padding: 0,
  },
});
