import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";

interface SpecialtiesListProps {
  specializations: string[];
}

export const SpecialtiesList = ({ specializations }: SpecialtiesListProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>SPECIALTIES</Text>
      <View style={styles.specialtiesCard}>
        {specializations && specializations.length > 0 ? (
          specializations.map((spec, index) => (
            <View
              key={index}
              style={[
                styles.specialtyItem,
                index === specializations.length - 1 && styles.noBorder,
              ]}
            >
              <Text style={styles.specialtyText}>{spec}</Text>
            </View>
          ))
        ) : (
          <View style={[styles.specialtyItem, styles.noBorder]}>
            <Text style={styles.specialtyText}>General therapy</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(3.5),
  },
  sectionLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#666",
    marginBottom: hp(1.5),
    letterSpacing: 0.5,
  },
  specialtiesCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    paddingHorizontal: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  specialtyItem: {
    paddingVertical: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  specialtyText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#333",
  },
});
