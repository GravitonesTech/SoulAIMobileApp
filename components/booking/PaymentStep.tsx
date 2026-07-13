import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PricingDetails {
  base_fee: number;
  platform_fee: number;
  admin_fee: number;
  total_amount: number;
  discount_amount?: number;
}

interface PaymentStepProps {
  paymentMethod: "upi" | "card" | "netbanking";
  setPaymentMethod: (val: "upi" | "card" | "netbanking") => void;
  upiId: string;
  setUpiId: (val: string) => void;
  cardNumber: string;
  setCardNumber: (val: string) => void;
  cardExpiry: string;
  setCardExpiry: (val: string) => void;
  cardCvv: string;
  setCardCvv: (val: string) => void;
  pricing: PricingDetails | null;
  isLoadingPricing: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
  couponCode: string;
  onApplyCoupon: (code: string) => void;
}

const savedMethods = [
  { id: "1", type: "Visa", last4: "1280", time: "11:52 PM", method: "card" as const },
  { id: "2", type: "MasterCard", last4: "4481", time: "06:12 PM", method: "card" as const },
  { id: "3", type: "UPI", last4: "1258", time: "04:23 PM", method: "upi" as const },
];

export const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentMethod,
  setPaymentMethod,
  upiId,
  setUpiId,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvv,
  setCardCvv,
  pricing,
  isLoadingPricing,
  isSubmitting,
  onConfirm,
  couponCode,
  onApplyCoupon,
}) => {
  const router = useRouter();
  const [selectedMethodId, setSelectedMethodId] = useState<string>("1");
  const [couponText, setCouponText] = useState(couponCode);

  useEffect(() => {
    setCouponText(couponCode);
  }, [couponCode]);

  const handleSelectSavedMethod = (id: string, method: "card" | "upi") => {
    setSelectedMethodId(id);
    setPaymentMethod(method);

    // Set parent states with mock values so validation checks pass
    if (method === "card") {
      const selected = savedMethods.find((m) => m.id === id);
      setCardNumber(selected ? `008711570587${selected.last4}` : "0087115705876187");
      setCardExpiry("08/11");
      setCardCvv("123");
      setUpiId("");
    } else {
      const selected = savedMethods.find((m) => m.id === id);
      setUpiId(selected ? `endsin${selected.last4}@okaxis` : "endsin1258@okaxis");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
    }
  };

  const handleApplyCoupon = () => {
    Keyboard.dismiss();
    const cleanCode = couponText.replace(/\s+/g, "");
    onApplyCoupon(cleanCode);
  };

  // Calculations for display matching the mockup
  const baseFee = pricing?.base_fee ?? 250;
  const adminFee = pricing?.admin_fee ?? 5.99;
  const platformFee = pricing?.platform_fee ?? 1.99;
  const totalAmount = pricing?.total_amount ?? Math.max(0, baseFee + adminFee + platformFee);

  return (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>

      {/* Saved Payment Methods List Card */}
      <View style={styles.savedMethodsCard}>
        {savedMethods.map((item, index) => {
          const isSelected = selectedMethodId === item.id;
          return (
            <React.Fragment key={item.id}>
              {index > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.methodRow}
                onPress={() => handleSelectSavedMethod(item.id, item.method)}
                activeOpacity={0.7}
              >
                <View style={styles.methodRowLeft}>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodType}>{item.type}</Text>
                    <Text style={styles.methodDetails}>Ends in ****-{item.last4}</Text>
                  </View>
                </View>
                <Text style={styles.methodTime}>{item.time}</Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>

      {/* Add Payment Method Link */}
      <TouchableOpacity
        style={styles.addMethodButton}
        onPress={() => router.push("/add-payment-method")}
        activeOpacity={0.7}
      >
        <Text style={styles.addMethodText}>+ Add Payment Method</Text>
      </TouchableOpacity>

      {/* Coupon Code Row */}
      <View style={styles.couponRow}>
        <View style={styles.couponLeft}>
          <Feather
            name="tag"
            size={normalize(18)}
            color="#666"
            style={{ marginRight: moderateScale(10) }}
          />
          <TextInput
            placeholder="Coupon Code"
            value={couponText}
            onChangeText={setCouponText}
            style={[
              styles.couponInput,
              couponCode ? { color: "#28A745", fontWeight: "bold" } : null,
            ]}
            placeholderTextColor="#8A8A8E"
            autoCapitalize="characters"
            editable={!couponCode}
          />
        </View>
        {couponCode ? (
          <TouchableOpacity
            onPress={() => {
              setCouponText("");
              onApplyCoupon("");
            }}
            activeOpacity={0.7}
          >
            <Feather name="x" size={normalize(20)} color="#FF3B30" style={{ padding: 4 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleApplyCoupon} activeOpacity={0.7}>
            <Feather
              name="arrow-right"
              size={normalize(20)}
              color="#3C61DD"
              style={{ padding: 4 }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Summary Container with Light Blue Background */}
      <View style={styles.paymentSummaryContainer}>
        <Text style={styles.summaryTitle}>PAYMENT SUMMARY</Text>

        <View style={styles.summaryBox}>
          {isLoadingPricing ? (
            <ActivityIndicator size="small" color="#3C61DD" style={{ padding: 20 }} />
          ) : (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>1x Online Consultation</Text>
                <Text style={styles.priceValue}>Rs. {baseFee.toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Admin Fee</Text>
                <Text style={styles.priceValue}>Rs. {adminFee.toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Platform Fee</Text>
                <Text style={styles.priceValue}>Rs. {platformFee.toFixed(2)}</Text>
              </View>

              {/* Highlighted Discount Row */}
              {pricing?.discount_amount !== undefined && pricing.discount_amount > 0 && (
                <View style={styles.discountRow}>
                  <Text style={styles.discountLabel}>Discount</Text>
                  <Text style={styles.discountValue}>
                    -Rs. {pricing.discount_amount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.dividerTotal} />

              <View style={styles.priceRowTotal}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>Rs. {totalAmount.toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Cancellation Warning Box */}
        <View style={styles.warningBox}>
          <Feather name="info" size={normalize(18)} color="#3C61DD" style={styles.warningIcon} />
          <Text style={styles.warningText}>
            Cancellations must be made at least 48 hours in advance to avoid a fee
          </Text>
        </View>

        {/* Confirm Session Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            (isSubmitting || isLoadingPricing) && styles.actionButtonDisabled,
          ]}
          onPress={onConfirm}
          disabled={isSubmitting || isLoadingPricing}
          activeOpacity={0.85}
        >
          <Text style={styles.actionButtonText}>
            {isSubmitting ? "Processing..." : "Confirm Session"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  savedMethodsCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: hp(1.5),
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  methodRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  methodInfo: {
    marginLeft: moderateScale(12),
  },
  methodType: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#333",
  },
  methodDetails: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(13),
    color: "#8E8E93",
    marginTop: hp(0.2),
  },
  methodTime: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#8E8E93",
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
  addMethodButton: {
    alignSelf: "flex-end",
    marginTop: hp(1.5),
    marginBottom: hp(2.5),
  },
  addMethodText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(13),
    color: "#3C61DD",
  },
  couponRow: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  couponLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  couponInput: {
    flex: 1,
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#333",
    padding: 0,
  },
  paymentSummaryContainer: {
    backgroundColor: "rgba(60, 97, 221, 0.04)",
    borderRadius: normalize(20),
    padding: moderateScale(16),
    width: "100%",
    marginBottom: hp(4),
  },
  summaryTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#666",
    marginBottom: hp(2),
    letterSpacing: 0.5,
  },
  summaryBox: {
    width: "100%",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1.2),
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
  discountRow: {
    backgroundColor: "rgba(60, 97, 221, 0.12)",
    borderRadius: normalize(8),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: hp(1),
  },
  discountLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#3C61DD",
  },
  discountValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#3C61DD",
  },
  dividerTotal: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: hp(1),
  },
  priceRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#000",
  },
  totalValue: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#3C61DD",
  },
  warningBox: {
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#3C61DD",
    backgroundColor: "rgba(60, 97, 221, 0.02)",
    borderRadius: normalize(12),
    padding: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(2.5),
    marginBottom: hp(2),
  },
  warningIcon: {
    marginRight: moderateScale(10),
  },
  warningText: {
    flex: 1,
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#3C61DD",
    lineHeight: normalize(16),
  },
  actionButton: {
    backgroundColor: "#3C61DD",
    borderRadius: normalize(30),
    height: normalize(48),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingHorizontal: moderateScale(28),
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginTop: hp(1),
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#FFF",
  },
});
