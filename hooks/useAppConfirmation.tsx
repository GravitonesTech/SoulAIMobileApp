import { Typography } from "@/constants/Typography";
import { store } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearConfirmation, setConfirmation } from "@/store/slices/confirmationSlice";
import { Feather } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

let confirmationCallback: (() => void) | undefined;
let cancelCallback: (() => void) | undefined;

export const AppConfirmation = () => {
  const dispatch = useAppDispatch();
  const { visible, title, message, cancelLabel, confirmLabel } = useAppSelector(
    (state) => state.confirmation,
  );

  const hideConfirmation = useCallback(() => {
    dispatch(clearConfirmation());
  }, [dispatch]);

  const modeStyles = {
    icon: "alert-triangle",
    color: "#FF9800",
    bg: "#FFF3E0",
  } as const;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.confirmationCard}>
          <View style={[styles.iconContainer, { backgroundColor: modeStyles.bg }]}>
            <Feather name={modeStyles.icon as any} size={40} color={modeStyles.color} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                cancelCallback?.();
                hideConfirmation();
              }}
            >
              <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: modeStyles.color },
                { flex: 1, marginLeft: 12 },
              ]}
              onPress={() => {
                confirmationCallback?.();
                hideConfirmation();
              }}
            >
              <Text style={styles.buttonText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const showConfirmationGlobal = (
  title: string,
  message: string,
  onConfirm?: () => void,
  options?: { cancelLabel?: string; confirmLabel?: string; onCancel?: () => void },
) => {
  confirmationCallback = onConfirm;
  cancelCallback = options?.onCancel;
  store.dispatch(
    setConfirmation({
      title,
      message,
      cancelLabel: options?.cancelLabel,
      confirmLabel: options?.confirmLabel,
    }),
  );
};

export const useAppConfirmation = () => {
  const dispatch = useAppDispatch();

  const showConfirmation = useCallback(
    (
      title: string,
      message: string,
      onConfirm?: () => void,
      options?: { cancelLabel?: string; confirmLabel?: string; onCancel?: () => void },
    ) => {
      confirmationCallback = onConfirm;
      cancelCallback = options?.onCancel;
      dispatch(
        setConfirmation({
          title,
          message,
          cancelLabel: options?.cancelLabel,
          confirmLabel: options?.confirmLabel,
        }),
      );
    },
    [dispatch],
  );

  const hideConfirmation = useCallback(() => {
    dispatch(clearConfirmation());
  }, [dispatch]);

  return { showConfirmation, hideConfirmation };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmationCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: Typography.fonts.medium,
    fontSize: 22,
    color: "#111111",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontFamily: Typography.fonts.regular,
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  cancelButtonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
    color: "#666666",
  },
  buttonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
    color: "#FFFFFF",
  },
});
