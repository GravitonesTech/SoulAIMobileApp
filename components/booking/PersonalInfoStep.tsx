import { AvailabilitySlots } from "@/components/therapist/AvailabilitySlots";
import { AppInput } from "@/components/ui/AppInput";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AvailabilityDay } from "@/types/therapist";

interface PersonalInfoStepProps {
  fullName: string;
  setFullName: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  emailId: string;
  setEmailId: (val: string) => void;
  selectedSlot: { day: string; slot: string; date?: string } | null;
  setSelectedSlot: (slot: { day: string; slot: string; date?: string } | null) => void;
  notes: string;
  setNotes: (val: string) => void;
  availability?: AvailabilityDay[];
  onContinue: () => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  emailId,
  setEmailId,
  selectedSlot,
  setSelectedSlot,
  notes,
  setNotes,
  availability,
  onContinue,
}) => {
  return (
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
          availability={availability}
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
        onPress={onContinue}
        activeOpacity={0.85}
      >
        <Text style={styles.actionButtonText}>Continue to Payment</Text>
      </TouchableOpacity>
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
  actionButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#FFF",
  },
});
