import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface FilterState {
  therapy: string;
  availability: string;
  experience: number;
  rating: string;
}

interface TherapistFilterModalProps {
  visible: boolean;
  onClose: () => void;
  activeFilters: FilterState;
  onApply: (filters: FilterState) => void;
  therapyOptions: string[];
}

export const TherapistFilterModal = ({
  visible,
  onClose,
  activeFilters,
  onApply,
  therapyOptions,
}: TherapistFilterModalProps) => {
  const [tempFilters, setTempFilters] = useState<FilterState>(activeFilters);

  // Option Picker Modal State
  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
  } | null>(null);

  // Sync tempFilters when modal becomes visible
  useEffect(() => {
    if (visible) {
      setTempFilters(activeFilters);
    }
  }, [visible, activeFilters]);

  const AVAILABILITY_OPTIONS = [
    "Any time",
    "10 AM - 12 PM",
    "12 PM - 2 PM",
    "2 PM - 4 PM",
    "4 PM - 6 PM",
    "6 PM - 8 PM",
  ];

  const RATING_OPTIONS = [
    "Any rating",
    "5.0",
    "4.0 or above",
    "3.0 or above",
    "2.0 or above",
    "1.0 or above",
  ];

  const handleApply = () => {
    onApply(tempFilters);
  };

  const handleClearAll = () => {
    setTempFilters({
      therapy: "All Therapy Types",
      availability: "Any time",
      experience: 1,
      rating: "Any rating",
    });
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <LinearGradient
          colors={["#FFFFFF", "#E2F4FF"]}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 1, y: 1 }}
          style={styles.filterContainer}
        >
          <SafeAreaView style={styles.filterSafeArea} edges={["top", "bottom"]}>
            {/* Header */}
            <View style={styles.filterHeader}>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelTextBtn}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.filterTitle}>Filter</Text>
              <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
                <Text style={styles.clearTextBtn}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {/* Therapy Filter */}
              <View style={styles.filterFieldContainer}>
                <Text style={styles.filterFieldLabel}>THERAPY</Text>
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  activeOpacity={0.8}
                  onPress={() =>
                    setPickerConfig({
                      visible: true,
                      title: "Select Therapy Type",
                      options: therapyOptions,
                      selectedValue: tempFilters.therapy,
                      onSelect: (val) => setTempFilters((prev) => ({ ...prev, therapy: val })),
                    })
                  }
                >
                  <Text style={styles.dropdownValueText}>{tempFilters.therapy}</Text>
                  <Feather name="chevron-down" size={normalize(20)} color="#A0A0A0" />
                </TouchableOpacity>
              </View>

              {/* Availability Filter */}
              <View style={styles.filterFieldContainer}>
                <Text style={styles.filterFieldLabel}>AVAILABILITY</Text>
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  activeOpacity={0.8}
                  onPress={() =>
                    setPickerConfig({
                      visible: true,
                      title: "Select Availability",
                      options: AVAILABILITY_OPTIONS,
                      selectedValue: tempFilters.availability,
                      onSelect: (val) => setTempFilters((prev) => ({ ...prev, availability: val })),
                    })
                  }
                >
                  <Text style={styles.dropdownValueText}>{tempFilters.availability}</Text>
                  <Feather name="chevron-down" size={normalize(20)} color="#A0A0A0" />
                </TouchableOpacity>
              </View>

              {/* Experience Level Filter */}
              <View style={styles.filterFieldContainer}>
                <Text style={styles.filterFieldLabel}>EXPERIENCE LEVEL</Text>
                <View style={styles.sliderContainer}>
                  <Slider
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={tempFilters.experience}
                    onValueChange={(val) =>
                      setTempFilters((prev) => ({ ...prev, experience: val }))
                    }
                    minimumTrackTintColor="#3C61DD"
                    maximumTrackTintColor="#E5E5EA"
                    thumbTintColor="#3C61DD"
                    style={styles.slider}
                  />
                  <View style={styles.sliderLabelsRow}>
                    <Text style={styles.sliderLimitText}>1 year</Text>
                    <Text style={styles.sliderValueMiddle}>
                      {tempFilters.experience} {tempFilters.experience === 1 ? "year" : "years"}
                    </Text>
                    <Text style={styles.sliderLimitText}>10 years</Text>
                  </View>
                </View>
              </View>

              {/* Rating Filter */}
              <View style={styles.filterFieldContainer}>
                <Text style={styles.filterFieldLabel}>RATING</Text>
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  activeOpacity={0.8}
                  onPress={() =>
                    setPickerConfig({
                      visible: true,
                      title: "Select Minimum Rating",
                      options: RATING_OPTIONS,
                      selectedValue: tempFilters.rating,
                      onSelect: (val) => setTempFilters((prev) => ({ ...prev, rating: val })),
                    })
                  }
                >
                  <Text style={styles.dropdownValueText}>{tempFilters.rating}</Text>
                  <Feather name="chevron-down" size={normalize(20)} color="#A0A0A0" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Apply Filter Button */}
            <TouchableOpacity
              style={styles.applyFilterBtn}
              activeOpacity={0.95}
              onPress={handleApply}
            >
              <View style={styles.checkCircle}>
                <Feather name="check" size={normalize(14)} color="#3C61DD" />
              </View>
              <Text style={styles.applyFilterBtnText}>Apply Filter</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>
      </Modal>

      {/* OPTION PICKER BOTTOM SHEET */}
      {pickerConfig && (
        <Modal
          visible={pickerConfig.visible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPickerConfig(null)}
        >
          <TouchableWithoutFeedback onPress={() => setPickerConfig(null)}>
            <View style={styles.pickerBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.pickerContent}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>{pickerConfig.title}</Text>
                    <TouchableOpacity onPress={() => setPickerConfig(null)}>
                      <Feather name="x" size={normalize(20)} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {pickerConfig.options.map((option) => {
                      const isSelected = option === pickerConfig.selectedValue;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[styles.pickerOption, isSelected && styles.pickerOptionSelected]}
                          onPress={() => {
                            pickerConfig.onSelect(option);
                            setPickerConfig(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              isSelected && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                          {isSelected && (
                            <Feather name="check" size={normalize(18)} color="#3C61DD" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flex: 1,
  },
  filterSafeArea: {
    flex: 1,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(24),
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  filterTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(20),
    color: "#000",
  },
  cancelTextBtn: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#666",
  },
  clearTextBtn: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#3C61DD",
  },
  filterScrollContent: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: hp(12),
  },
  filterFieldContainer: {
    marginBottom: hp(3),
  },
  filterFieldLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#666",
    marginBottom: hp(1.5),
    letterSpacing: 0.5,
  },
  dropdownSelector: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: "#E5E5EA",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(18),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  dropdownValueText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#333",
  },
  sliderContainer: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(18),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  slider: {
    width: "100%",
    height: hp(4),
  },
  sliderLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(0.5),
  },
  sliderLimitText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#999",
  },
  sliderValueMiddle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#3C61DD",
  },
  applyFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3C61DD",
    borderRadius: normalize(28),
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(20),
    position: "absolute",
    bottom: hp(4),
    right: moderateScale(24),
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  checkCircle: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(10),
  },
  applyFilterBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#FFF",
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    maxHeight: hp(60),
    paddingBottom: hp(4),
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  pickerTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#000",
  },
  pickerScroll: {
    paddingHorizontal: moderateScale(24),
    marginTop: hp(1),
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8FA",
  },
  pickerOptionSelected: {},
  pickerOptionText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(15),
    color: "#333",
  },
  pickerOptionTextSelected: {
    fontFamily: Typography.fonts.bold,
    color: "#3C61DD",
  },
});
