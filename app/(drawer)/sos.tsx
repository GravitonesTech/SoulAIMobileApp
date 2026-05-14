import { AppHeader } from "@/components/ui/AppHeader";
import { EMERGENCY_SERVICES, SOS_CONTACTS } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SOSScreen() {
  const makeCall = (number: string) => {
    Linking.openURL(`tel:${number.replace(/\s/g, "")}`);
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Header */}
        <AppHeader leftIcon="arrow-left" title="SOS!" titleColor="#FF3B30" />

        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Contacts Section */}
          <View style={styles.contactsList}>
            {SOS_CONTACTS.map((contact, _index) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactItem}
                activeOpacity={0.7}
                onPress={() => makeCall("9999999999")}
              >
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={styles.contactRight}>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <Feather name="arrow-right" size={normalize(18)} color="#D1D1D1" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Emergency Card */}
          <View style={styles.emergencyCard}>
            {EMERGENCY_SERVICES.map((service, index) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceItem,
                  index === EMERGENCY_SERVICES.length - 1 && styles.noBorder,
                ]}
                activeOpacity={0.7}
                onPress={() => makeCall(service.number)}
              >
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.serviceRight}>
                  <Text style={styles.serviceNumber}>{service.number}</Text>
                  <View style={[styles.dot, { backgroundColor: service.color }]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* SOS Button */}
          <TouchableOpacity style={styles.sosButton} activeOpacity={0.8}>
            <Text style={styles.sosButtonText}>SOS phone call</Text>
          </TouchableOpacity>

          {/* Footer Disclaimer */}
          <View style={styles.footer}>
            <Feather
              name="alert-circle"
              size={normalize(20)}
              color="#3C61DD"
              style={styles.alertIcon}
            />
            <Text style={styles.footerText}>
              SOS phone call answers to a human therapist for your immediate attention
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(28),
    paddingBottom: moderateScale(20),
  },
  contactsList: {
    marginBottom: hp(16),
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: moderateScale(18),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  contactName: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#111111",
  },
  contactRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  contactPhone: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#D1D1D1",
  },
  emergencyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(16),
    paddingHorizontal: moderateScale(16),
    marginBottom: hp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: moderateScale(18),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  serviceName: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#333",
  },
  serviceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  serviceNumber: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#333",
  },
  dot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
  },
  sosButton: {
    borderWidth: 1.5,
    borderColor: "#FF3B30",
    borderRadius: normalize(12),
    paddingVertical: moderateScale(16),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(5),
  },
  sosButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#FF3B30",
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: moderateScale(10),
  },
  alertIcon: {
    marginBottom: hp(1.5),
  },
  footerText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#3C61DD",
    textAlign: "center",
    lineHeight: normalize(20),
  },
});
