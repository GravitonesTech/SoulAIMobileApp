import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { GoogleIcon } from "./Icons";

interface AuthLoadingModalProps {
  visible: boolean;
  provider?: "google" | "apple";
  title?: string;
  subtitle?: string;
  statusText?: string;
}

export const AuthLoadingModal = ({
  visible,
  provider = "google",
  title,
  subtitle,
  statusText,
}: AuthLoadingModalProps) => {
  const getIcon = () => {
    switch (provider) {
      case "apple":
        return <AntDesign name="apple" size={normalize(32)} color="#000000" />;
      case "google":
      default:
        return <GoogleIcon size={normalize(32)} />;
    }
  };

  const defaultTitle = provider === "google" ? "Google Authorization" : "Apple Authorization";
  const defaultSubtitle = `Please wait while we securely authenticate your account and sync details.`;
  const defaultStatus =
    provider === "google" ? "Connecting to Google..." : "Connecting to Apple...";

  return (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={() => {}}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>{getIcon()}</View>

          <Text style={styles.modalTitle}>{title ?? defaultTitle}</Text>
          <Text style={styles.modalSubtitle}>{subtitle ?? defaultSubtitle}</Text>

          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#5858E8" />
            <Text style={styles.loadingText}>{statusText ?? defaultStatus}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 30, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(24),
    padding: normalize(28),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  iconContainer: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(32),
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: normalize(20),
    borderWidth: 1,
    borderColor: "#EAECEF",
  },
  modalTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(20),
    color: "#1E293B",
    marginBottom: normalize(8),
    textAlign: "center",
  },
  modalSubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#64748B",
    textAlign: "center",
    lineHeight: normalize(20),
    marginBottom: normalize(24),
  },
  spinnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(50),
    gap: normalize(10),
  },
  loadingText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#475569",
  },
});
