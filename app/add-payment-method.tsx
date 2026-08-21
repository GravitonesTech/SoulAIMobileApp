import { AppHeader } from "@/components/ui/AppHeader";
import { AppInput } from "@/components/ui/AppInput";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddPaymentMethodScreen() {
  const router = useRouter();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Billing Address
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formatting helpers
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    const matches = cleaned.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return cleaned;
    }
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Virtual card formatter
  const getVirtualCardNumber = () => {
    if (!cardNumber) return "0087 1157 0587 6187";
    const cleaned = cardNumber.replace(/\s/g, "");
    const parts = [];
    for (let i = 0; i < 16; i += 4) {
      if (cleaned.length > i) {
        parts.push(cleaned.slice(i, i + 4).padEnd(4, "•"));
      } else {
        parts.push("••••");
      }
    }
    return parts.join(" ");
  };

  const handleAddCard = async () => {
    if (!fullName.trim()) {
      toast.error("Validation Error", "Full Name is required.");
      return;
    }
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, "").length < 16) {
      toast.error("Validation Error", "Please enter a valid 16-digit card number.");
      return;
    }
    if (!expiryDate.trim() || !expiryDate.includes("/") || expiryDate.length < 5) {
      toast.error("Validation Error", "Please enter expiry date (MM/YY).");
      return;
    }
    if (!cvv.trim() || cvv.length < 3) {
      toast.error("Validation Error", "Please enter a valid CVV.");
      return;
    }
    if (!streetAddress.trim()) {
      toast.error("Validation Error", "Street Address is required.");
      return;
    }
    if (!city.trim()) {
      toast.error("Validation Error", "City is required.");
      return;
    }
    if (!zipCode.trim()) {
      toast.error("Validation Error", "Zip Code is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post<any>(ENDPOINTS.users.savePaymentMethod, {
        full_name: fullName.trim(),
        card_number: cardNumber,
        expiry_date: expiryDate.trim(),
        street_address: streetAddress.trim(),
        apartment: apartment.trim(),
        city: city.trim(),
        zip_code: zipCode.trim(),
        is_default: true,
      });

      if (response.success) {
        toast.success("Success", response.message || "Payment method saved successfully");
        router.back();
      } else {
        toast.error("Error", response.message || "Failed to save payment method");
      }
    } catch (error) {
      console.error("[AddPaymentMethod] Error saving payment method:", error);
      toast.error("Error", "A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <AppHeader
          leftIcon="arrow-left"
          onLeftPress={() => router.back()}
          title="Add Payment Method"
          showAvatar={true}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Virtual Credit Card */}
            <LinearGradient
              colors={["#1F2B5B", "#101633"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.virtualCard}
            >
              {/* Contactless Icon */}
              <View style={styles.cardHeader}>
                <Feather
                  name="wifi"
                  size={normalize(22)}
                  color="rgba(255,255,255,0.75)"
                  style={styles.contactlessIcon}
                />
              </View>

              {/* Card Footer Details */}
              <View style={styles.cardFooter}>
                <View style={styles.cardFooterLeft}>
                  <Text style={styles.cardHolderLabel}>
                    {fullName ? fullName.toUpperCase() : "JANE DOE"}
                  </Text>
                  <Text style={styles.cardNoText}>{getVirtualCardNumber()}</Text>
                </View>
                <View style={styles.cardFooterRight}>
                  <Text style={styles.cardExpiryText}>{expiryDate || "08/11"}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* General Info Form Section */}
            <Text style={styles.formSectionTitle}>GENERAL INFORMATION</Text>

            <AppInput
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              style={styles.inputSpacing}
            />

            <AppInput
              placeholder="Card Number"
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
              keyboardType="number-pad"
              style={styles.inputSpacing}
            />

            <View style={styles.rowInputs}>
              <View style={styles.flexHalf}>
                <AppInput
                  placeholder="Expiry Date"
                  value={expiryDate}
                  onChangeText={(t) => setExpiryDate(formatExpiry(t))}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.flexHalf}>
                <AppInput
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 4))}
                  keyboardType="number-pad"
                  secureTextEntry
                />
              </View>
            </View>

            {/* Billing Address Form Section */}
            <Text style={styles.formSectionTitle}>BILLING ADDRESS</Text>

            <AppInput
              placeholder="Street Address"
              value={streetAddress}
              onChangeText={setStreetAddress}
              style={styles.inputSpacing}
            />

            <AppInput
              placeholder="Apartment"
              value={apartment}
              onChangeText={setApartment}
              style={styles.inputSpacing}
            />

            <View style={styles.rowInputs}>
              <View style={styles.flexHalf}>
                <AppInput placeholder="City" value={city} onChangeText={setCity} />
              </View>
              <View style={styles.flexHalf}>
                <AppInput
                  placeholder="Zip Code"
                  value={zipCode}
                  onChangeText={(t) => setZipCode(t.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Submit Action Button */}
            <TouchableOpacity
              onPress={handleAddCard}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={styles.submitBtnWrapper}
            >
              <LinearGradient
                colors={["#3C61DD", "#43A4F3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? "Processing..." : "Add Card"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: hp(6),
  },
  virtualCard: {
    width: "100%",
    height: hp(22),
    borderRadius: normalize(16),
    padding: moderateScale(20),
    justifyContent: "space-between",
    marginVertical: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  contactlessIcon: {
    transform: [{ rotate: "90deg" }],
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardFooterLeft: {
    flex: 1,
  },
  cardHolderLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(10),
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.8,
    marginBottom: hp(0.5),
  },
  cardNoText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#FFF",
    letterSpacing: 1,
  },
  cardFooterRight: {
    alignItems: "flex-end",
    gap: hp(0.6),
  },
  cardExpiryText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#FFF",
    letterSpacing: 0.5,
  },
  formSectionTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#666",
    marginTop: hp(2.5),
    marginBottom: hp(1.5),
    letterSpacing: 0.5,
  },
  inputSpacing: {
    marginBottom: hp(1.5),
  },
  rowInputs: {
    flexDirection: "row",
    gap: wp(4),
    marginBottom: hp(1.5),
  },
  flexHalf: {
    flex: 1,
  },
  submitBtnWrapper: {
    alignSelf: "flex-end",
    marginTop: hp(3),
    borderRadius: normalize(24),
    overflow: "hidden",
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtn: {
    height: normalize(48),
    paddingHorizontal: moderateScale(28),
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#FFF",
  },
});
