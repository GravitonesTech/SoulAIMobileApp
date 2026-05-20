import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RenameModalProps {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function RenameModal({ visible, value, onChangeText, onClose, onSave }: RenameModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuBackdrop} onPress={onClose}>
        <Pressable style={styles.renameCard} onPress={() => {}}>
          <Text style={styles.renameTitle}>Rename conversation</Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Enter a new name"
            placeholderTextColor="#A0A0A0"
            style={styles.renameInput}
            autoFocus
          />
          <View style={styles.renameButtons}>
            <TouchableOpacity
              style={[styles.renameBtn, styles.renameBtnSecondary]}
              activeOpacity={0.7}
              onPress={onClose}
            >
              <Text style={[styles.renameBtnText, styles.renameBtnTextSecondary]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.renameBtn, styles.renameBtnPrimary]}
              activeOpacity={0.7}
              onPress={onSave}
            >
              <Text style={styles.renameBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  renameCard: {
    marginHorizontal: wp(5.3),
    marginTop: hp(27),
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  renameTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#111111",
    marginBottom: hp(1),
  },
  renameInput: {
    height: moderateScale(46),
    borderRadius: normalize(12),
    paddingHorizontal: moderateScale(12),
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#111111",
  },
  renameButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: moderateScale(8),
    marginTop: hp(1.7),
  },
  renameBtn: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
    borderRadius: normalize(12),
    minWidth: moderateScale(90),
    alignItems: "center",
  },
  renameBtnPrimary: {
    backgroundColor: "#3C61DD",
  },
  renameBtnSecondary: {
    backgroundColor: "rgba(60, 97, 221, 0.08)",
  },
  renameBtnText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
  renameBtnTextSecondary: {
    color: "#3C61DD",
  },
});
