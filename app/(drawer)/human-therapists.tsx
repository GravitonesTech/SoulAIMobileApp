import { TOP_THERAPISTS } from "@/constants/StaticData";
import { AppHeader } from "@/components/ui/AppHeader";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HumanTherapistsScreen() {
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filteredTherapists = useMemo(() => {
    if (!searchText.trim()) return [];
    return TOP_THERAPISTS.filter((t) => t.name.toLowerCase().includes(searchText.toLowerCase()));
  }, [searchText]);

  const showSearchResults = searchText.length > 0;

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <AppHeader leftIcon="arrow-left" title="Human Therapists" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View
              style={[styles.searchBar, (isFocused || showSearchResults) && styles.searchBarActive]}
            >
              <TextInput
                placeholder="Search for a therapist"
                placeholderTextColor="#A0A0A0"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <MaterialIcons name="filter-list" size={normalize(24)} color="#333" />
            </TouchableOpacity>
          </View>

          {showSearchResults ? (
            /* Search Results */
            <View style={styles.searchResultsContainer}>
              {filteredTherapists.map((therapist) => (
                <TouchableOpacity
                  key={therapist.id}
                  style={styles.searchResultItem}
                  onPress={() => {
                    setSearchText("");
                    // navigation to therapist details could go here
                  }}
                >
                  <View style={styles.searchResultLeft}>
                    <Feather name="sun" size={normalize(20)} color="#333" />
                    <Text style={styles.searchResultName}>{therapist.name}</Text>
                  </View>
                  <Feather name="arrow-right" size={normalize(18)} color="#A0A0A0" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <>
              {/* Upcoming Appointment */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>UPCOMING APPOINTMENT</Text>
                <View style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View>
                      <Text style={styles.therapistName}>Dr. Z Chen</Text>
                      <Text style={styles.sessionInfo}>30 minutes Session</Text>
                    </View>
                    <Text style={styles.appointmentTime}>April 26, 2026 at 5:00 PM</Text>
                  </View>

                  <TouchableOpacity style={styles.actionRow}>
                    <View style={styles.actionLeft}>
                      <Feather name="user" size={normalize(20)} color="#333" />
                      <Text style={styles.actionText}>Join Session</Text>
                    </View>
                    <Feather name="chevron-right" size={normalize(18)} color="#A0A0A0" />
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionRow, styles.noBorder]}>
                    <View style={styles.actionLeft}>
                      <Feather name="alert-circle" size={normalize(20)} color="#E53935" />
                      <Text style={[styles.actionText, styles.cancelText]}>Cancel Session</Text>
                    </View>
                    <Feather name="chevron-right" size={normalize(18)} color="#A0A0A0" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Recent */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>RECENT</Text>
                <View style={styles.recentCard}>
                  <View style={styles.recentHeader}>
                    <View>
                      <Text style={styles.therapistName}>Dr. John Nolan</Text>
                      <Text style={styles.ratingText}>4.1 Rating</Text>
                      <Text style={styles.specializationText}>
                        Specialized in Cognitive Therapy
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={normalize(24)} color="#A0A0A0" />
                  </View>
                  <Image
                    source={require("@/assets/images/therapist.png")}
                    style={styles.recentImage}
                  />
                </View>
              </View>

              {/* Top Therapists */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>TOP THERAPISTS</Text>
                {TOP_THERAPISTS.map((therapist, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.therapistListItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.therapistListLeft}>
                      <View style={styles.listAvatarContainer}>
                        <Image source={therapist.image} style={styles.avatar} />
                      </View>
                      <View style={styles.listInfo}>
                        <Text style={styles.therapistName}>{therapist.name}</Text>
                        <Text style={styles.ratingText}>{therapist.rating}</Text>
                        <Text style={styles.specializationText}>{therapist.specialization}</Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={normalize(24)} color="#A0A0A0" />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
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
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: hp(4),
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1),
    marginBottom: hp(3),
    gap: moderateScale(15),
  },
  searchBar: {
    flex: 1,
    height: moderateScale(48),
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: normalize(24),
    paddingHorizontal: moderateScale(20),
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchBarActive: {
    backgroundColor: "#FFF",
    borderColor: "#3C61DD",
  },
  searchInput: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#000",
  },
  filterButton: {
    padding: moderateScale(5),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#666",
    marginBottom: hp(1.5),
    letterSpacing: 0.5,
  },
  appointmentCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  therapistName: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#000",
  },
  sessionInfo: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#666",
    marginTop: hp(0.5),
  },
  appointmentTime: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    lineHeight: normalize(18),
    color: "#E53935",
    textAlign: "right",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: moderateScale(14),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  noBorder: {
    borderTopWidth: 1,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  actionText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#000",
  },
  cancelText: {
    color: "#E53935",
  },
  recentCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp(2),
  },
  ratingText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#666",
    marginTop: hp(0.3),
  },
  specializationText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#999",
    marginTop: hp(0.5),
  },
  recentImage: {
    width: "100%",
    height: hp(35),
    borderRadius: normalize(12),
    resizeMode: "cover",
  },
  therapistListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(12),
    marginBottom: hp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  therapistListLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(15),
  },
  listAvatarContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: normalize(25),
    backgroundColor: "#D1E5FF",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  listInfo: {
    flex: 1,
  },
  searchResultsContainer: {
    marginTop: hp(1),
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  searchResultLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(15),
  },
  searchResultName: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#000",
  },
  noResultContainer: {
    alignItems: "center",
    marginTop: hp(5),
  },
  noResultTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(20),
    color: "#000",
    marginBottom: hp(2),
  },
  noResultSubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#666",
    textAlign: "center",
    lineHeight: normalize(22),
    paddingHorizontal: moderateScale(10),
    marginBottom: hp(4),
  },
  suggestionsCard: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    paddingHorizontal: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  noBottomBorder: {
    borderBottomWidth: 0,
  },
  suggestionName: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#000",
  },
});
