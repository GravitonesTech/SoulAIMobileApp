import { BookingProgressBar } from "@/components/booking/BookingProgressBar";
import { PaymentStep } from "@/components/booking/PaymentStep";
import { PaymentVerificationOverlay } from "@/components/booking/PaymentVerificationOverlay";
import { PersonalInfoStep } from "@/components/booking/PersonalInfoStep";
import { TherapistSummaryCard } from "@/components/booking/TherapistSummaryCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { RAZORPAY_KEY_ID } from "@/constants/Config";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { useAppSelector } from "@/store/hooks";
import { Therapist } from "@/types/therapist";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookSessionScreen() {
  const router = useRouter();
  const { therapistJson, selectedSlotJson } = useLocalSearchParams<{
    therapistJson: string;
    selectedSlotJson: string;
  }>();

  const therapist = useMemo<Therapist | null>(() => {
    if (!therapistJson) return null;
    try {
      return JSON.parse(therapistJson);
    } catch {
      return null;
    }
  }, [therapistJson]);

  const initialSlot = useMemo<{ day: string; slot: string; date?: string } | null>(() => {
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
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.phone_number || "");
  const [emailId, setEmailId] = useState(user?.email || "");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.full_name && !fullName) {
        setFullName(user.full_name);
      }
      if ((user.phone || user.phone_number) && !phoneNumber) {
        setPhoneNumber(user.phone || user.phone_number || "");
      }
      if (user.email && !emailId) {
        setEmailId(user.email);
      }
    }
  }, [user]);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    slot: string;
    date?: string;
  } | null>(initialSlot);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing States
  const [pricing, setPricing] = useState<{
    base_fee: number;
    platform_fee: number;
    admin_fee: number;
    total_amount: number;
    discount_amount?: number;
  } | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const finalPayableAmount = useMemo(() => {
    if (pricing) {
      return pricing.total_amount;
    }
    return 257.98; // Fallback total
  }, [pricing]);

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [savedMethods, setSavedMethods] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (currentStep === 2) {
        const fetchSavedMethods = async () => {
          try {
            const response = await apiClient.get<any[]>(ENDPOINTS.users.getSavedPaymentMethods);
            if (response.success && response.data) {
              setSavedMethods(response.data);
            }
          } catch (error) {
            console.error("Error fetching saved payment methods:", error);
          }
        };
        fetchSavedMethods();
      }
    }, [currentStep]),
  );

  const getApiFormattedDate = (dayName: string) => {
    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
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
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Validation Error", "Phone Number must be at least 10 digits.");
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

  const fetchPricingSummary = async () => {
    if (!therapist) return;
    setIsLoadingPricing(true);
    try {
      const response = await apiClient.get<any>(
        ENDPOINTS.users.appointmentPricingSummary(therapist.id),
      );
      if (response.success && response.data) {
        setPricing({
          base_fee: response.data.base_fee,
          platform_fee: response.data.platform_fee,
          admin_fee: response.data.admin_fee,
          total_amount: response.data.total_amount,
        });
      } else {
        console.warn(
          "Pricing summary fetch failed, using default fallback pricing:",
          response.message,
        );
        setPricing({
          base_fee: 100,
          platform_fee: 0,
          admin_fee: 0,
          total_amount: 100,
        });
      }
    } catch (err) {
      console.error("Error fetching pricing summary:", err);
      setPricing({
        base_fee: 100,
        platform_fee: 0,
        admin_fee: 0,
        total_amount: 100,
      });
    } finally {
      setIsLoadingPricing(false);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    if (!therapist) return;
    const cleanCode = code.replace(/\s+/g, "");
    if (!cleanCode) {
      setCouponCode("");
      toast.info("Coupon Removed", "Discount coupon cleared.");
      fetchPricingSummary();
      return;
    }

    setIsLoadingPricing(true);
    try {
      const response = await apiClient.post<any>(ENDPOINTS.users.validateCoupon, {
        code: cleanCode,
        therapist_id: therapist.id,
      });

      if (response.success && response.data) {
        setCouponCode(cleanCode.toUpperCase());
        setPricing({
          base_fee: response.data.session_cost,
          platform_fee: response.data.platform_fee,
          admin_fee: response.data.admin_fee,
          total_amount: response.data.final_amount,
          discount_amount: response.data.discount_amount,
        });
        toast.success("Coupon Applied", response.message || "Coupon applied successfully!");
      } else {
        toast.error("Invalid Coupon", response.message || "Coupon is invalid.");
      }
    } catch (err: any) {
      console.warn("Failed to validate coupon:", err);
      toast.error("Error", "Failed to validate coupon.");
    } finally {
      setIsLoadingPricing(false);
    }
  };

  const handleContinueToPayment = () => {
    if (validatePersonalInfo()) {
      setCurrentStep(2);
      fetchPricingSummary();
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
    const appointmentDate = selectedSlot.date || getApiFormattedDate(selectedSlot.day);

    // Find original slot name in therapist.schedules to match the backend slot duration format (e.g. "10:00 AM - 01:00 PM")
    let apiTimeSlot = selectedSlot.slot;
    const daySchedule = therapist.schedules?.find(
      (s) => s.day_of_week.toLowerCase() === selectedSlot.day.toLowerCase(),
    );
    if (daySchedule) {
      const normalizeTimeStr = (str: string) => {
        return str
          .replace(/\s+/g, "")
          .toLowerCase()
          .replace(/(?:^|[^0-9])0([0-9]:)/g, "$1");
      };

      const matchedOriginalSlot = daySchedule.time_slots.find((as) =>
        normalizeTimeStr(as).includes(normalizeTimeStr(selectedSlot.slot)),
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
      contact_email: emailId.trim(),
      notes: notes.trim() || "Looking forward to the session",
      coupon_code: couponCode || undefined,
    };

    try {
      const response = await apiClient.post<any>(ENDPOINTS.users.bookAppointment, payload);
      if (!response.success || !response.data) {
        toast.error("Booking Failed", response.message || "Failed to book session.");
        setIsSubmitting(false);
        return;
      }

      const bookingData = response.data;
      const orderId = bookingData.razorpay_order_id;
      const appointmentId = bookingData.id;

      if (!orderId) {
        toast.error("Payment Error", "Razorpay order ID was not generated by the server.");
        setIsSubmitting(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        description: `Booking with ${therapist.full_name}`,
        image: therapist.profile_photo || undefined,
        currency: "INR",
        key: RAZORPAY_KEY_ID,
        amount: String(Math.round(finalPayableAmount * 100)), // Convert to paise
        name: "Soul AI",
        order_id: orderId,
        prefill: {
          email: bookingData.patient_email || emailId.trim(),
          contact: bookingData.patient_phone || phoneNumber.trim(),
          name: bookingData.patient_name || fullName.trim(),
          method:
            paymentMethod === "upi" ? "upi" : paymentMethod === "card" ? "card" : "netbanking",
          ...(paymentMethod === "card" && cardNumber.trim()
            ? {
                card: {
                  number: cardNumber.replace(/\s+/g, ""),
                  expiry: cardExpiry.trim(),
                  cvv: cardCvv.trim(),
                  name: fullName.trim(),
                },
              }
            : {}),
        },
        theme: { color: "#3C61DD" },
      };

      console.log("=================== RAZORPAY CHECKOUT OPTIONS ===================");
      console.log(JSON.stringify(options, null, 2));
      console.log("=================================================================");
      let razorpayResponse: any;
      try {
        razorpayResponse = await RazorpayCheckout.open(options);
        console.log("Razorpay Checkout Success:", razorpayResponse);
      } catch (razorpayError: any) {
        console.error("Razorpay Error:", razorpayError);
        let errorMsg = "Payment cancelled or failed.";
        if (razorpayError && typeof razorpayError.description === "string") {
          if (
            !razorpayError.description.startsWith("{") &&
            !razorpayError.description.includes("BAD_REQUEST_ERROR") &&
            razorpayError.description !== "undefined"
          ) {
            errorMsg = razorpayError.description;
          } else {
            try {
              const parsed = JSON.parse(razorpayError.description);
              if (parsed?.error?.description && parsed.error.description !== "undefined") {
                errorMsg = parsed.error.description;
              } else if (parsed?.error?.reason) {
                errorMsg = "Payment failed due to " + parsed.error.reason.replace(/_/g, " ") + ".";
              }
            } catch (e) {
              // Ignore and use default errorMsg
            }
          }
        }
        toast.error("Payment Failed", errorMsg);
        setIsSubmitting(false);
        router.push("/payment-failed");
        return;
      }

      // Show payment verification screen overlay
      setIsVerifying(true);

      // Verify payment with the backend
      const verifyPayload = {
        appointment_id: appointmentId,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      };

      console.log("Sending verification to server:", verifyPayload);
      const verifyResponse = await apiClient.post<any>(
        ENDPOINTS.users.verifyAppointmentPayment,
        verifyPayload,
      );

      if (verifyResponse.success) {
        toast.success("Booking Confirmed!", "Your session has been successfully booked.");
        router.replace("/booking-success");
      } else {
        toast.error("Verification Failed", verifyResponse.message || "Failed to verify payment.");
        setIsVerifying(false);
        router.push("/payment-failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error", "Could not connect to the server.");
      setIsVerifying(false);
    } finally {
      setIsSubmitting(false);
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
            <BookingProgressBar currentStep={currentStep} />

            {/* Therapist Summary Header Card */}
            <TherapistSummaryCard therapist={therapist} selectedSlot={selectedSlot} />

            {currentStep === 1 ? (
              /* ================== STEP 1: PERSONAL INFO ================== */
              <PersonalInfoStep
                fullName={fullName}
                setFullName={setFullName}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                emailId={emailId}
                setEmailId={setEmailId}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                notes={notes}
                setNotes={setNotes}
                availability={therapist.availability}
                onContinue={handleContinueToPayment}
              />
            ) : (
              /* ================== STEP 2: PAYMENT ================== */
              <PaymentStep
                savedMethods={savedMethods}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                upiId={upiId}
                setUpiId={setUpiId}
                cardNumber={cardNumber}
                setCardNumber={setCardNumber}
                cardExpiry={cardExpiry}
                setCardExpiry={setCardExpiry}
                cardCvv={cardCvv}
                setCardCvv={setCardCvv}
                pricing={pricing}
                isLoadingPricing={isLoadingPricing}
                isSubmitting={isSubmitting}
                onConfirm={handleConfirmBooking}
                couponCode={couponCode}
                onApplyCoupon={handleApplyCoupon}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <PaymentVerificationOverlay visible={isVerifying} therapistName={therapist.full_name} />
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
});
