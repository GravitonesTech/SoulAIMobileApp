import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface TherapistSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onSubmit: () => void;
  showClear: boolean;
  onClear: () => void;
  onFilterPress?: () => void;
}

export const TherapistSearchBar = ({
  value,
  onChangeText,
  isFocused,
  onFocus,
  onBlur,
  onSubmit,
  showClear,
  onClear,
  onFilterPress,
}: TherapistSearchBarProps) => {
  return (
    <View style={styles.searchSection}>
      <View style={[styles.searchBar, (isFocused || showClear) && styles.searchBarActive]}>
        <Feather name="search" size={normalize(18)} color="#A0A0A0" />
        <TextInput
          placeholder="Search for a therapist"
          placeholderTextColor="#A0A0A0"
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
        />
        {showClear && (
          <TouchableOpacity onPress={onClear}>
            <Feather name="x" size={normalize(18)} color="#A0A0A0" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress} activeOpacity={0.7}>
        <MaterialIcons name="filter-list" size={normalize(24)} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1),
    marginBottom: hp(2.5),
  },
  searchBar: {
    flex: 1,
    height: hp(6),
    backgroundColor: "#F2F3F7",
    borderRadius: normalize(24),
    borderWidth: 1.5,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
    paddingHorizontal: moderateScale(15),
  },
  searchBarActive: {
    backgroundColor: "#FFF",
    borderColor: "#3C61DD",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: normalize(14),
    color: "#000",
  },
  filterButton: {
    marginLeft: moderateScale(12),
    padding: moderateScale(4),
  },
});
