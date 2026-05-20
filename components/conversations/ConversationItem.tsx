import { type Conversation } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import React, { forwardRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ConversationItemProps {
  item: Conversation;
  isLast: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export const ConversationItem = forwardRef<View, ConversationItemProps>(
  ({ item, isLast, onPress, onLongPress }, ref) => {
    return (
      <View ref={ref}>
        <TouchableOpacity
          style={[styles.conversationItem, isLast && styles.noBorder]}
          activeOpacity={0.7}
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={250}
        >
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
                {item.title}
              </Text>
              <Text style={styles.itemTime}>{item.timestamp}</Text>
            </View>
            <Text style={styles.itemSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
);

ConversationItem.displayName = "ConversationItem";

const styles = StyleSheet.create({
  conversationItem: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(15),
    borderBottomWidth: 0.5,
    borderBottomColor: "#F2F2F2",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  itemTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#000",
    flex: 1,
    marginRight: moderateScale(12),
  },
  itemTime: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#8A8A8E",
  },
  itemSubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#8A8A8E",
  },
});
