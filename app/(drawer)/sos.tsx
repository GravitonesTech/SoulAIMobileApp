import { EMERGENCY_SERVICES, SOS_CONTACTS } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SOSScreen() {
  const router = useRouter();

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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SOS!</Text>
          <TouchableOpacity onPress={() => {}} style={styles.avatarButton}>
            <View style={styles.avatarContainer}>
              <Image source={require("@/assets/images/avatar.png")} style={styles.avatar} />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Contacts Section */}
          <View style={styles.contactsList}>
            {SOS_CONTACTS.map((contact, index) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactItem}
                activeOpacity={0.7}
                onPress={() => makeCall("9999999999")}
              >
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={styles.contactRight}>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <Feather name="arrow-right" size={18} color="#D1D1D1" />
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
            <Feather name="alert-circle" size={20} color="#3C61DD" style={styles.alertIcon} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: 22,
    color: "#FF3B30", // Red title as per design
  },
  avatarButton: {
    padding: 2,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1E5FF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingHorizontal: 28,
    // paddingTop: 5,
    paddingBottom: 20,
  },
  contactsList: {
    marginBottom: 130,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  contactName: {
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
    color: "#111111",
  },
  contactRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactPhone: {
    fontFamily: Typography.fonts.regular,
    fontSize: 14,
    color: "#D1D1D1",
  },
  emergencyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
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
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  serviceName: {
    fontFamily: Typography.fonts.medium,
    fontSize: 15,
    color: "#333",
  },
  serviceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceNumber: {
    fontFamily: Typography.fonts.medium,
    fontSize: 15,
    color: "#333",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sosButton: {
    borderWidth: 1.5,
    borderColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  sosButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: "#FF3B30",
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  alertIcon: {
    marginBottom: 12,
  },
  footerText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: "#3C61DD",
    textAlign: "center",
    lineHeight: 20,
  },
});
