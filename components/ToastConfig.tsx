import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BaseToast, ErrorToast, ToastConfig as ToastConfigType } from "react-native-toast-message";

export const toastConfig: ToastConfigType = {
  success: (props) => (
    <BaseToast
      {...props}
      text2NumberOfLines={2}
      style={{
        borderLeftColor: Colors.brand.dotGreen,
        backgroundColor: "#FFFFFF",
        height: "auto",
        minHeight: 70,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 5,
        width: "90%",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontFamily: Typography.fonts.medium,
        fontSize: 16,
        color: "#111",
      }}
      text2Style={{
        fontFamily: Typography.fonts.regular,
        fontSize: 13,
        color: "#666",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text2NumberOfLines={2}
      style={{
        borderLeftColor: "#FF5252",
        backgroundColor: "#FFFFFF",
        height: "auto",
        minHeight: 70,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 5,
        width: "90%",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontFamily: Typography.fonts.medium,
        fontSize: 16,
        color: "#111",
      }}
      text2Style={{
        fontFamily: Typography.fonts.regular,
        fontSize: 13,
        color: "#666",
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      text2NumberOfLines={2}
      style={{
        borderLeftColor: Colors.therapy.blue,
        backgroundColor: "#FFFFFF",
        height: "auto",
        minHeight: 70,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 5,
        width: "90%",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontFamily: Typography.fonts.medium,
        fontSize: 16,
        color: "#111",
      }}
      text2Style={{
        fontFamily: Typography.fonts.regular,
        fontSize: 13,
        color: "#666",
      }}
    />
  ),
  inAppNotification: ({ text1, text2, props }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={props?.onPress}
      style={styles.notificationContainer}
    >
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.leftStripe}
      />
      <View style={styles.contentRow}>
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.end]}
          style={styles.iconWrapper}
        >
          <Feather name="bell" size={normalize(16)} color="#FFFFFF" />
        </LinearGradient>

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.appTitle}>SOUL AI</Text>
            <View style={styles.dot} />
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {text1}
            </Text>
          </View>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {text2}
          </Text>
        </View>

        <View style={styles.arrowWrapper}>
          <Feather name="chevron-right" size={normalize(16)} color="#A0A0A0" />
        </View>
      </View>
    </TouchableOpacity>
  ),
};

const styles = StyleSheet.create({
  notificationContainer: {
    width: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: "center",
    marginTop: Platform.OS === "ios" ? hp(1.5) : hp(2.5),
  },
  leftStripe: {
    width: 6,
    height: "100%",
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(14),
  },
  iconWrapper: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.3),
  },
  appTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(10),
    color: "#5858E8",
    letterSpacing: 0.8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#A0A0A0",
    marginHorizontal: moderateScale(6),
  },
  notificationTitle: {
    flex: 1,
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(13),
    color: "#111111",
  },
  notificationBody: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#555555",
    lineHeight: normalize(16),
  },
  arrowWrapper: {
    marginLeft: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
});
