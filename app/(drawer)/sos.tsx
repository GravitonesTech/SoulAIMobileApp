import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { SosContact, SosResponseData } from "@/types/api";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function SOSScreen() {
  const [emergencyContacts, setEmergencyContacts] = useState<SosContact[]>([]);
  const [generalServices, setGeneralServices] = useState<SosContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSosContacts();
  }, []);

  const fetchSosContacts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<SosResponseData>(ENDPOINTS.master.getAllSosContacts);
      if (response.success && response.data) {
        const contacts = response.data.contacts || [];
        // Filter contacts
        const emergency = contacts.filter((c) => c.is_emergency && c.is_active);
        const general = contacts.filter((c) => !c.is_emergency && c.is_active);
        setEmergencyContacts(emergency);
        setGeneralServices(general);
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to load contacts",
          text2: response.message || "An error occurred",
          position: "bottom",
        });
      }
    } catch (error) {
      console.error("[SOS] Error fetching contacts:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to connect to the server",
        position: "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const makeCall = (number: string) => {
    Linking.openURL(`tel:${number.replace(/\s/g, "")}`);
  };

  const getDotColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("police")) return "#4CAF50";
    if (lower.includes("ambulance")) return "#FFC107";
    if (lower.includes("fire")) return "#F44336";
    return "#3C61DD"; // Default blue
  };

  const handleSosButtonClick = () => {
    if (emergencyContacts.length > 0) {
      makeCall(emergencyContacts[0].phone_number);
    } else {
      Toast.show({
        type: "info",
        text1: "No Emergency Contacts",
        text2: "No emergency phone number available.",
        position: "bottom",
      });
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <AppHeader leftIcon="arrow-left" title="SOS!" titleColor="#FF3B30" />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3B30" />
          </View>
        ) : (
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Contacts Section */}
            {emergencyContacts.length > 0 && (
              <View style={styles.contactsList}>
                {emergencyContacts.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactItem}
                    activeOpacity={0.7}
                    onPress={() => makeCall(contact.phone_number)}
                  >
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <View style={styles.contactRight}>
                      <Text style={styles.contactPhone}>{contact.phone_number}</Text>
                      <Feather name="arrow-right" size={normalize(18)} color="#D1D1D1" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Emergency Card */}
            {generalServices.length > 0 && (
              <View style={styles.emergencyCard}>
                {generalServices.map((service, index) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceItem,
                      index === generalServices.length - 1 && styles.noBorder,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => makeCall(service.phone_number)}
                  >
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={styles.serviceRight}>
                      <Text style={styles.serviceNumber}>{service.phone_number}</Text>
                      <View style={[styles.dot, { backgroundColor: getDotColor(service.name) }]} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* SOS Button */}
            <TouchableOpacity
              style={styles.sosButton}
              activeOpacity={0.8}
              onPress={handleSosButtonClick}
            >
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
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
