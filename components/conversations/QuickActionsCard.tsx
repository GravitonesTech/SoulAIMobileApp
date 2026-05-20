import { CONVERSATIONS_QUICK_ACTIONS } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function QuickActionsCard() {
  const router = useRouter();
  const quickActions = CONVERSATIONS_QUICK_ACTIONS;

  return (
    <View style={styles.quickActionsCard}>
      {quickActions.map((action, index) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.quickActionRow, index === quickActions.length - 1 && styles.noBorder]}
          activeOpacity={0.7}
          onPress={() => action.route && router.push(action.route as any)}
        >
          <View style={styles.quickActionLeft}>
            <Feather name={action.icon as any} size={normalize(18)} color={action.color} />
            <Text style={[styles.quickActionText, action.id === "sos" && styles.sosActionText]}>
              {action.label}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={normalize(18)}
            color={action.id === "sos" ? "#FF3B30" : "#C7C7CC"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(15),
    marginBottom: hp(1.7),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  quickActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
    borderBottomWidth: 0.5,
    borderBottomColor: "#F2F2F2",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  quickActionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  quickActionText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#1C1C1E",
  },
  sosActionText: {
    color: "#FF3B30",
  },
});
