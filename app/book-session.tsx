import { AvailabilitySlots } from "@/components/therapist/AvailabilitySlots";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppInput } from "@/components/ui/AppInput";
import { Typography } from "@/constants/Typography";
import { ENDPOINTS } from "@/constants/endpoints";
import { useAppSelector } from "@/store/hooks";
import { Therapist } from "@/types/therapist";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function BookSessionScreen() {
  const router = useRouter();
  const { therapistJson, selectedSlotJson } = useLocalSearchParams<{
    therapistJson: string;
    selectedSlotJson: string;
  }>();

  const therapist = React.useMemo<Therapist | null>(() => {
    if (!therapistJson) return null;
    try {
      return JSON.parse(therapistJson);
    } catch {
      return null;
    }
  }, [therapistJson]);

  const initialSlot = React.useMemo<{ day: string; slot: string } | null>(() => {
    if (!selectedSlotJson) return null;
    try {
      return JSON.parse(selectedSlotJson);
    } catch {
      return null;
    }
  }, [selectedSlotJson]);

  const user = useAppSelector((state) => state.auth.user);

  // Form States
  const [currentStep, setCurrentStep] = useState<1 | 2>(1); // 1 = Personal Info, 2 = Payment
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [emailId, setEmailId] = useState(user?.email || "");
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; slot: string } | null>(initialSlot);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const getSlotFormattedDate = (dayName: string, slotTime: string) => {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const now = new Date();
    const currentDayIndex = now.getDay();

    const targetDayIndex = daysOfWeek.indexOf(dayName.toLowerCase());
    if (targetDayIndex === -1) return `${dayName} at ${slotTime}`;

    let diff = targetDayIndex - currentDayIndex;
    if (diff < 0) {
      diff += 7;
    }
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);

    const monthStr = targetDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return `${monthStr} at ${slotTime}`;
  };

  const getApiFormattedDate = (dayName: string) => {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const now = new Date();
    const currentDayIndex = now.getDay();

    const targetDayIndex = daysOfWeek.indexOf(dayName.toLowerCase());
    if (targetDayIndex === -1) return now.toISOString().split("T")[0];

    let diff = targetDayIndex - currentDayIndex;
    if (diff < 0) {
      diff += 7;
    }
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);

    return targetDate.toISOString().split("T")[0];
  };

  const validatePersonalInfo = () => {
    if (!fullName.trim()) {
      toast.error("Validation Error", "Full Name is required.");
      return false;
    }
    if (!phoneNumber.trim()) {
      toast.error("Validation Error", "Phone Number is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailId.trim() || !emailRegex.test(emailId)) {
      toast.error("Validation Error", "Please enter a valid email address.");
      return false;
    }
    if (!selectedSlot) {
      toast.error("Validation Error", "Please select a session slot.");
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (validatePersonalInfo()) {
      setCurrentStep(2);
    }
  };

  const handleConfirmBooking = async () => {
    if (!therapist || !selectedSlot) return;

    // Payment validation
    if (paymentMethod === "upi" && !upiId.trim()) {
      toast.error("Payment Error", "Please enter your UPI ID.");
      return;
    }
    if (paymentMethod === "card") {
      if (!cardNumber.trim() || cardNumber.length < 16) {
        toast.error("Payment Error", "Please enter a valid card number.");
        return;
      }
      if (!cardExpiry.trim() || !cardExpiry.includes("/")) {
        toast.error("Payment Error", "Please enter expiration date MM/YY.");
        return;
      }
      if (!cardCvv.trim() || cardCvv.length < 3) {
        toast.error("Payment Error", "Please enter a valid CVV.");
        return;
      }
    }

    setIsSubmitting(true);
    const appointmentDate = getApiFormattedDate(selectedSlot.day);

    // Find original slot name in therapist.schedules to match the backend slot duration format (e.g. "10:00 AM - 01:00 PM")
    let apiTimeSlot = selectedSlot.slot;
    const daySchedule = therapist.schedules?.find(
      (s) => s.day_of_week.toLowerCase() === selectedSlot.day.toLowerCase()
    );
    if (daySchedule) {
      const matchedOriginalSlot = daySchedule.time_slots.find(
        (as) =>
          as.replace(/\s+/g, "").toLowerCase().includes(selectedSlot.slot.replace(/\s+/g, "").toLowerCase())
      );
      if (matchedOriginalSlot) {
        apiTimeSlot = matchedOriginalSlot;
      }
    }

    const payload = {
      therapist_id: therapist.id,
      appointment_date: appointmentDate,
      time_slot: apiTimeSlot,
      patient_name: fullName.trim(),
      patient_phone: phoneNumber.trim(),
      notes: notes.trim() || "Looking forward to the session",
    };

    let success = false;
    try {
      const response = await apiClient.post(ENDPOINTS.users.bookAppointment, payload);
      if (response.success) {
        success = true;
      } else {
        toast.error("Booking Failed", response.message || "Failed to book session.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error", "Could not connect to the server.");
    } finally {
      setIsSubmitting(false);
    }

    if (success) {
      toast.success("Booking Confirmed!", "Your session has been successfully booked.");
      router.replace("/(drawer)/human-therapists");
    }
  };

  if (!therapist) {
    return (
      <View style={styles.loadingScreen}>
        <AppHeader leftIcon="arrow-left" title="Book Session" />
        <LinearGradient colors={["#FFFFFF", "#E2F4FF"]} style={styles.loadingContent}>
          <Text style={styles.errorText}>Therapist details could not be loaded.</Text>
        </LinearGradient>
      </View>
    );
  }

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
          onLeftPress={() => {
            if (currentStep === 2) {
              setCurrentStep(1);
            } else {
              router.back();
            }
          }}
          title="Book Session"
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
            {/* Step Progress Bar */}
            <View style={styles.stepProgressContainer}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepOuterCircle,
                    currentStep === 1 ? styles.stepOuterActive : styles.stepOuterInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.stepInnerDot,
                      currentStep === 1 ? styles.stepInnerActive : styles.stepInnerInactive,
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    currentStep === 1 ? styles.stepLabelActive : styles.stepLabelInactive,
                  ]}
                >
                  Personal Info
                </Text>
              </View>

              <View
                style={[
                  styles.progressLine,
                  currentStep === 2 ? styles.lineActive : styles.lineInactive,
                ]}
              />

              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepOuterCircle,
                    currentStep === 2 ? styles.stepOuterActive : styles.stepOuterInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.stepInnerDot,
                      currentStep === 2 ? styles.stepInnerActive : styles.stepInnerInactive,
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    currentStep === 2 ? styles.stepLabelActive : styles.stepLabelInactive,
                  ]}
                >
                  Payment
                </Text>
              </View>
            </View>

            {/* Therapist Summary Header Card */}
            <View style={styles.therapistCard}>
              <View style={styles.therapistLeft}>
                <Text style={styles.therapistName}>{therapist.full_name}</Text>
                <Text style={styles.sessionDuration}>30 minutes Session</Text>
              </View>
              {selectedSlot && (
                <View style={styles.therapistRight}>
                  <Text style={styles.slotText}>
                    {getSlotFormattedDate(selectedSlot.day, selectedSlot.slot)}
                  </Text>
                </View>
              )}
            </View>

            {currentStep === 1 ? (
              /* ================== STEP 1: PERSONAL INFO ================== */
              <View style={styles.stepContent}>
                {/* Identification Section */}
                <Text style={styles.sectionTitle}>IDENTIFICATION</Text>
                <View style={styles.inputsGroup}>
                  <AppInput
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    inputStyle={styles.inputField}
                    placeholderTextColor="#8A8A8E"
                  />
                  <AppInput
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    inputStyle={styles.inputField}
                    placeholderTextColor="#8A8A8E"
                  />
                  <AppInput
                    placeholder="Email ID"
                    value={emailId}
                    onChangeText={setEmailId}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    inputStyle={styles.inputField}
                    placeholderTextColor="#8A8A8E"
                  />
                </View>

                {/* Session Slots Selector */}
                <View style={styles.slotsSection}>
                  <AvailabilitySlots
                    schedules={therapist.schedules}
                    selectedSlot={selectedSlot}
                    onChangeSlot={setSelectedSlot}
                  />
                </View>

                {/* Notes Input */}
                <Text style={styles.sectionTitle}>NOTES FOR THERAPIST (OPTIONAL)</Text>
                <View style={styles.noteContainer}>
                  <AppInput
                    placeholder="Describe any specifics you want the therapist to know..."
                    value={notes}
                    onChangeText={(text) => {
                      if (text.length <= 300) setNotes(text);
                    }}
                    multiline
                    maxLength={300}
                    style={styles.noteInputWrapper}
                    inputStyle={styles.noteInput}
                    placeholderTextColor="#8A8A8E"
                  />
                  <View style={styles.noteFooter}>
                    <Text style={styles.charCount}>{notes.length}/300</Text>
                    <Feather name="corner-right-down" size={normalize(12)} color="#A0A0A0" />
                  </View>
                </View>

                {/* Submit Action */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleContinueToPayment}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionButtonText}>Continue to Payment</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ================== STEP 2: PAYMENT ================== */
              <View style={styles.stepContent}>
                <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>

                {/* UPI Option */}
                <TouchableOpacity
                  style={[
                    styles.paymentOptionCard,
                    paymentMethod === "upi" && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod("upi")}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentOptionHeader}>
                    <View style={styles.paymentOptionLeft}>
                      <Feather
                        name="smartphone"
                        size={normalize(20)}
                        color={paymentMethod === "upi" ? "#3C61DD" : "#555"}
                      />
                      <Text style={styles.paymentOptionTitle}>UPI (Paytm, PhonePe, GPay)</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        paymentMethod === "upi" && styles.radioCircleSelected,
                      ]}
                    >
                      {paymentMethod === "upi" && <View style={styles.radioDot} />}
                    </View>
                  </View>
                  {paymentMethod === "upi" && (
                    <View style={styles.paymentInputContainer}>
                      <AppInput
                        placeholder="Enter UPI ID (e.g. username@okaxis)"
                        value={upiId}
                        onChangeText={setUpiId}
                        autoCapitalize="none"
                        inputStyle={styles.inputField}
                        placeholderTextColor="#8A8A8E"
                      />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Credit/Debit Card Option */}
                <TouchableOpacity
                  style={[
                    styles.paymentOptionCard,
                    paymentMethod === "card" && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod("card")}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentOptionHeader}>
                    <View style={styles.paymentOptionLeft}>
                      <Feather
                        name="credit-card"
                        size={normalize(20)}
                        color={paymentMethod === "card" ? "#3C61DD" : "#555"}
                      />
                      <Text style={styles.paymentOptionTitle}>Credit / Debit Card</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        paymentMethod === "card" && styles.radioCircleSelected,
                      ]}
                    >
                      {paymentMethod === "card" && <View style={styles.radioDot} />}
                    </View>
                  </View>
                  {paymentMethod === "card" && (
                    <View style={styles.paymentInputContainer}>
                      <AppInput
                        placeholder="Card Number"
                        value={cardNumber}
                        onChangeText={(t) => setCardNumber(t.replace(/\D/g, "").slice(0, 16))}
                        keyboardType="number-pad"
                        inputStyle={styles.inputField}
                        placeholderTextColor="#8A8A8E"
                      />
                      <View style={styles.cardRow}>
                        <View style={{ flex: 1, marginRight: wp(2) }}>
                          <AppInput
                            placeholder="Expiry (MM/YY)"
                            value={cardExpiry}
                            onChangeText={(t) => {
                              const cleaned = t.replace(/\D/g, "");
                              if (cleaned.length > 2) {
                                setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
                              } else {
                                setCardExpiry(cleaned);
                              }
                            }}
                            keyboardType="number-pad"
                            inputStyle={styles.inputField}
                            placeholderTextColor="#8A8A8E"
                          />
                        </View>
                        <View style={{ flex: 1, marginLeft: wp(2) }}>
                          <AppInput
                            placeholder="CVV"
                            value={cardCvv}
                            onChangeText={(t) => setCardCvv(t.replace(/\D/g, "").slice(0, 4))}
                            keyboardType="number-pad"
                            secureTextEntry
                            inputStyle={styles.inputField}
                            placeholderTextColor="#8A8A8E"
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Net Banking Option */}
                <TouchableOpacity
                  style={[
                    styles.paymentOptionCard,
                    paymentMethod === "netbanking" && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod("netbanking")}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentOptionHeader}>
                    <View style={styles.paymentOptionLeft}>
                      <Feather
                        name="home"
                        size={normalize(20)}
                        color={paymentMethod === "netbanking" ? "#3C61DD" : "#555"}
                      />
                      <Text style={styles.paymentOptionTitle}>Net Banking</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        paymentMethod === "netbanking" && styles.radioCircleSelected,
                      ]}
                    >
                      {paymentMethod === "netbanking" && <View style={styles.radioDot} />}
                    </View>
                  </View>
                  {paymentMethod === "netbanking" && (
                    <Text style={styles.netbankingNote}>
                      Redirecting to your bank secure checkout portal on verification.
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Pricing Breakout Card */}
                <View style={styles.priceSummaryCard}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Consultation Fee</Text>
                    <Text style={styles.priceValue}>Rs. 100.00</Text>
                  </View>
                  <View style={[styles.priceRow, styles.priceRowTotal]}>
                    <Text style={styles.totalLabel}>Total Payable</Text>
                    <Text style={styles.totalValue}>Rs. 100.00</Text>
                  </View>
                </View>

                {/* Submit Booking Action */}
                <TouchableOpacity
                  style={[styles.actionButton, isSubmitting && styles.actionButtonDisabled]}
                  onPress={handleConfirmBooking}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionButtonText}>
                    {isSubmitting ? "Processing..." : "Confirm & Pay Rs. 100"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  loadingScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
  },
  errorText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#E53935",
    textAlign: "center",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: hp(8),
  },
  stepProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: hp(2),
    paddingHorizontal: wp(5),
  },
  stepItem: {
    alignItems: "center",
    width: wp(25),
  },
  stepOuterCircle: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  stepOuterActive: {
    borderColor: "#3C61DD",
  },
  stepOuterInactive: {
    borderColor: "#D1D1D6",
  },
  stepInnerDot: {
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(6),
  },
  stepInnerActive: {
    backgroundColor: "#3C61DD",
  },
  stepInnerInactive: {
    backgroundColor: "transparent",
  },
  stepLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(11),
    marginTop: hp(0.8),
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#3C61DD",
  },
  stepLabelInactive: {
    color: "#8E8E93",
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: wp(-2),
    marginTop: hp(-2),
  },
  lineActive: {
    backgroundColor: "#3C61DD",
  },
  lineInactive: {
    backgroundColor: "#E5E5EA",
  },
  therapistCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: hp(3),
  },
  therapistLeft: {
    flex: 1,
  },
  therapistName: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#000",
  },
  sessionDuration: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#666",
    marginTop: hp(0.4),
  },
  therapistRight: {
    alignItems: "flex-end",
    marginLeft: moderateScale(10),
  },
  slotText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#E53935",
    textAlign: "right",
  },
  stepContent: {
    width: "100%",
  },
  sectionTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#666",
    marginBottom: hp(1.5),
    letterSpacing: 0.5,
  },
  inputsGroup: {
    gap: hp(1.2),
    marginBottom: hp(3),
  },
  inputField: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
  },
  slotsSection: {
    marginBottom: hp(1),
  },
  noteContainer: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: hp(4),
  },
  noteInputWrapper: {
    backgroundColor: "transparent",
    borderWidth: 0,
    height: hp(12),
    paddingHorizontal: 0,
  },
  noteInput: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    textAlignVertical: "top",
    height: "100%",
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    paddingTop: hp(1),
    marginTop: hp(1),
  },
  charCount: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#A0A0A0",
  },
  actionButton: {
    backgroundColor: "#3C61DD",
    borderRadius: normalize(30),
    height: normalize(52),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingHorizontal: moderateScale(28),
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginTop: hp(2),
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#FFF",
  },
  paymentOptionCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    marginBottom: hp(2),
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  paymentOptionSelected: {
    borderColor: "#3C61DD",
  },
  paymentOptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  paymentOptionTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#333",
  },
  radioCircle: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    borderWidth: 2,
    borderColor: "#D1D1D6",
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: "#3C61DD",
  },
  radioDot: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
    backgroundColor: "#3C61DD",
  },
  paymentInputContainer: {
    marginTop: hp(2),
    gap: hp(1.2),
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  netbankingNote: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#666",
    marginTop: hp(1.5),
    lineHeight: normalize(18),
  },
  priceSummaryCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    marginTop: hp(2),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1.2),
  },
  priceRowTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    paddingTop: hp(1.5),
    marginBottom: 0,
  },
  priceLabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#666",
  },
  priceValue: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#333",
  },
  totalLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#000",
  },
  totalValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#3C61DD",
  },
});
