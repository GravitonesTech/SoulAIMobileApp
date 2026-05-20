import { Typography } from "@/constants/Typography";
import { moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ContextMenuModalProps {
  visible: boolean;
  anchor: { top: number; left: number };
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function ContextMenuModal({
  visible,
  anchor,
  onClose,
  onRename,
  onDelete,
}: ContextMenuModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuBackdrop} onPress={onClose}>
        <View style={styles.menuLayer} pointerEvents="box-none">
          <Pressable
            style={[styles.contextMenu, { top: anchor.top, left: anchor.left }]}
            onPress={() => {}}
          >
            <TouchableOpacity style={styles.menuAction} activeOpacity={0.7} onPress={onRename}>
              <Feather name="edit-2" size={normalize(18)} color="#1C1C1E" />
              <Text style={styles.menuActionText}>Rename</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuAction} activeOpacity={0.7} onPress={onDelete}>
              <Feather name="trash-2" size={normalize(18)} color="#1C1C1E" />
              <Text style={styles.menuActionText}>Delete</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  menuLayer: {
    flex: 1,
  },
  contextMenu: {
    position: "absolute",
    width: moderateScale(240),
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: moderateScale(14),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  menuAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
  },
  menuActionText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#1C1C1E",
  },
  menuDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
});
