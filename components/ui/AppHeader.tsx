import { Typography } from "@/constants/Typography";
import { useAppSelector } from "@/store/hooks";
import { moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { UserAvatar } from "./UserAvatar";

interface AppHeaderProps {
  leftIcon?: keyof typeof Feather.glyphMap;
  onLeftPress?: () => void;
  title?: string;
  titleColor?: string;
  iconColor?: string;
  showBadge?: boolean;
  showAvatar?: boolean;
  onAvatarPress?: () => void;
  onNewChatPress?: () => void;
  isNewChatDisabled?: boolean;
  rightContent?: React.ReactNode;
  animateTitle?: boolean;
}

export const AppHeader = ({
  leftIcon = "menu",
  onLeftPress,
  title,
  titleColor = "#000",
  iconColor = "#333",
  showBadge = false,
  showAvatar = true,
  onAvatarPress,
  onNewChatPress,
  isNewChatDisabled = false,
  rightContent,
  animateTitle = false,
}: AppHeaderProps) => {
  const router = useRouter();
  const navigation = useNavigation();
  const user = useAppSelector((state) => state.auth.user);

  const handleLeftPress = () => {
    if (onLeftPress) {
      onLeftPress();
    } else if (leftIcon === "arrow-left") {
      navigation.goBack();
    } else if (leftIcon === "menu") {
      try {
        (navigation as any).openDrawer();
      } catch (e) {
        console.warn("Drawer navigation not found", e);
      }
    }
  };

  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else {
      router.push("/profile");
    }
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={handleLeftPress}
        style={styles.iconButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name={leftIcon} size={normalize(26)} color={iconColor} />
      </TouchableOpacity>

      <View style={styles.middleContainer}>
        {title ? (
          <Animated.View
            key={title}
            entering={animateTitle ? SlideInRight.duration(600) : undefined}
          >
            {showBadge ? (
              <View style={[styles.badge, { flexShrink: 1, maxWidth: wp(60) }]}>
                <Text style={styles.badgeText} numberOfLines={1} ellipsizeMode="tail">
                  {title}
                </Text>
              </View>
            ) : (
              <Text
                style={[styles.headerTitle, { color: titleColor, flexShrink: 1, maxWidth: wp(60) }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
            )}
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.rightSide}>
        {onNewChatPress && (
          <TouchableOpacity
            onPress={onNewChatPress}
            style={[styles.newChatButton, isNewChatDisabled && { opacity: 0.6 }]}
            activeOpacity={0.8}
            disabled={isNewChatDisabled}
          >
            <View style={styles.plusIconCircle}>
              <Feather name="plus" size={normalize(18)} color="#333" />
            </View>
            <Text style={styles.newChatText}>New chat</Text>
          </TouchableOpacity>
        )}

        {rightContent ? (
          <View style={styles.rightContentContainer}>{rightContent}</View>
        ) : showAvatar ? (
          <TouchableOpacity onPress={handleAvatarPress}>
            <UserAvatar size={normalize(38)} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(15),
    backgroundColor: "transparent",
  },
  iconButton: {
    padding: moderateScale(5),
    width: moderateScale(40),
    alignItems: "flex-start",
  },
  middleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(20),
    lineHeight: normalize(38),
    color: "#000",
    textAlign: "center",
  },
  badge: {
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(8),
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: "#3C61DD",
    backgroundColor: "transparent",
  },
  badgeText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#333",
  },
  rightSide: {
    flexDirection: "row",
    alignItems: "center",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3C61DD",
    paddingVertical: moderateScale(6),
    paddingLeft: moderateScale(6),
    paddingRight: moderateScale(16),
    borderRadius: normalize(25),
    marginRight: moderateScale(10),
  },
  plusIconCircle: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(10),
  },
  newChatText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
  rightContentContainer: {
    width: moderateScale(40),
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
