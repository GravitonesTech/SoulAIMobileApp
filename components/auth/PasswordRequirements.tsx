import { Typography } from "@/constants/Typography";
import { hp, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  if (!password) return null;

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "At least one number (0-9)", met: /\d/.test(password) },
    { label: "At least one special character (e.g., @$!%*?&)", met: /[@$!%*?&]/.test(password) },
  ];

  return (
    <View style={styles.container}>
      {requirements.map((req, index) => (
        <View
          key={index}
          style={[styles.row, index === requirements.length - 1 && { marginBottom: 0 }]}
        >
          <Feather
            name={req.met ? "check-circle" : "circle"}
            size={normalize(14)}
            color={req.met ? "#43C6B1" : "rgba(226, 232, 240, 0.65)"}
            style={styles.icon}
          />
          <Text style={[styles.text, req.met ? styles.metText : styles.unmetText]}>
            {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: normalize(8),
    padding: normalize(12),
    marginTop: -hp(0.5),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.6),
  },
  icon: {
    marginRight: normalize(8),
  },
  text: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
  },
  metText: {
    color: "#43C6B1",
    opacity: 1,
  },
  unmetText: {
    color: "#E2E8F0",
    opacity: 0.75,
  },
});
