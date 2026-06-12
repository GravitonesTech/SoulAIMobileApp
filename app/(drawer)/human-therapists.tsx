import { AppHeader } from "@/components/ui/AppHeader";
import { UserInitialsAvatar } from "@/components/ui/UserInitialsAvatar";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Therapist {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  profile_photo: string | null;
  license_number: string | null;
  specialization: string[];
  experience_years: number;
  bio: string;
  clinic_address: string | null;
  is_approved: boolean;
  average_rating: number;
  total_reviews: number;
  schedules: {
    day_of_week: string;
    time_slots: string[];
  }[];
}

interface Appointment {
  id: number;
  patient_email: string;
  patient_name: string;
  patient_phone: string;
  therapist_id: number;
  appointment_date: string;
  time_slot: string;
  appointment_status: string;
  notes: string | null;
  status: boolean;
  created_at: string;
  therapist_name: string;
  therapist_photo: string | null;
  therapist_specialization: string[];
}

export default function HumanTherapistsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [searchedTherapists, setSearchedTherapists] = useState<Therapist[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchTherapistsAndAppointments = useCallback(async () => {
    setIsLoading(true);
    setIsAppointmentsLoading(true);
    setError(null);

    const [therapistsRes, appointmentsRes] = await Promise.allSettled([
      apiClient.get<Therapist[]>(ENDPOINTS.users.topRatedTherapists),
      apiClient.get<{ upcoming: Appointment[]; past: any[] }>(ENDPOINTS.users.myAppointments),
    ]);

    if (
      therapistsRes.status === "fulfilled" &&
      therapistsRes.value.success &&
      therapistsRes.value.data
    ) {
      setTherapists(therapistsRes.value.data);
    } else {
      const msg =
        therapistsRes.status === "fulfilled" ? therapistsRes.value.message : "Network error";
      setError(msg || "Failed to load therapists");
    }
    setIsLoading(false);

    if (
      appointmentsRes.status === "fulfilled" &&
      appointmentsRes.value.success &&
      appointmentsRes.value.data
    ) {
      setUpcomingAppointments(appointmentsRes.value.data.upcoming || []);
    }
    setIsAppointmentsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTherapistsAndAppointments();
    }, [fetchTherapistsAndAppointments]),
  );

  const performSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchedTherapists([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await apiClient.get<{
        total_count: number;
        page: number;
        page_size: number;
        total_pages: number;
        therapists: Therapist[];
      }>(ENDPOINTS.users.getAllTherapists, {
        params: {
          page: 1,
          page_size: 10,
          search_query: trimmed,
        },
      });

      if (response.success && response.data) {
        setSearchedTherapists(response.data.therapists || []);
      } else {
        setSearchError(response.message || "Failed to search therapists");
      }
    } catch {
      setSearchError("An unexpected network error occurred");
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchText.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
      setSearchedTherapists([]);
      setSearchError(null);
    }

    const handler = setTimeout(() => {
      performSearch(searchText);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, performSearch]);

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
              style={[
                styles.searchBar,
                (isFocused || showSearchResults) && styles.searchBarActive,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: moderateScale(10),
                  paddingHorizontal: moderateScale(15),
                },
              ]}
            >
              <Feather name="search" size={normalize(18)} color="#A0A0A0" />
              <TextInput
                placeholder="Search for a therapist"
                placeholderTextColor="#A0A0A0"
                style={[styles.searchInput, { flex: 1 }]}
                value={searchText}
                onChangeText={setSearchText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                returnKeyType="search"
                onSubmitEditing={() => performSearch(searchText)}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText("")}
                  style={{ padding: moderateScale(4) }}
                >
                  <Feather name="x" size={normalize(18)} color="#A0A0A0" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <MaterialIcons name="filter-list" size={normalize(24)} color="#333" />
            </TouchableOpacity>
          </View>

          {showSearchResults ? (
            /* Search Results */
            <View style={styles.searchResultsContainer}>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3C61DD" />
                </View>
              ) : searchError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{searchError}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => performSearch(searchText)}
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : searchedTherapists.length === 0 ? (
                <View style={styles.noResultContainer}>
                  <Text style={styles.noResultTitle}>No results found</Text>
                  <Text style={styles.noResultSubtitle}>
                    {`We couldn't find any therapist matching "${searchText}"`}
                  </Text>
                </View>
              ) : (
                searchedTherapists.map((therapist) => (
                  <TouchableOpacity
                    key={therapist.id}
                    style={styles.therapistListItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSearchText("");
                      router.push({
                        pathname: "/therapist-details",
                        params: {
                          id: therapist.id.toString(),
                          therapistJson: JSON.stringify(therapist),
                        },
                      } as any);
                    }}
                  >
                    <View style={styles.therapistListLeft}>
                      <View style={styles.listAvatarContainer}>
                        {therapist.profile_photo ? (
                          <Image source={{ uri: therapist.profile_photo }} style={styles.avatar} />
                        ) : (
                          <UserInitialsAvatar name={therapist.full_name} textSize={normalize(18)} />
                        )}
                      </View>
                      <View style={styles.listInfo}>
                        <Text style={styles.therapistName}>{therapist.full_name}</Text>
                        <Text style={styles.ratingText}>
                          {therapist.average_rating > 0
                            ? `${therapist.average_rating.toFixed(1)} Rating`
                            : "0.0 Rating"}
                          {therapist.total_reviews > 0
                            ? ` (${therapist.total_reviews} reviews)`
                            : ""}
                        </Text>
                        <Text style={styles.specializationText} numberOfLines={2}>
                          {therapist.specialization && therapist.specialization.length > 0
                            ? `Specialized in ${therapist.specialization.join(", ")}`
                            : "General Practitioner"}
                        </Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={normalize(24)} color="#A0A0A0" />
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            <>
              {/* Upcoming Appointment */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>UPCOMING APPOINTMENTS</Text>
                {isAppointmentsLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3C61DD" />
                  </View>
                ) : upcomingAppointments.length === 0 ? (
                  <View style={styles.appointmentEmptyCard}>
                    <Text style={styles.appointmentEmptyText}>No upcoming sessions scheduled.</Text>
                  </View>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <View
                      key={appointment.id}
                      style={[styles.appointmentCard, { marginBottom: hp(1.5) }]}
                    >
                      <View style={styles.appointmentHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.therapistName}>{appointment.therapist_name}</Text>
                          <Text style={styles.sessionInfo}>
                            {appointment.therapist_specialization &&
                            appointment.therapist_specialization.length > 0
                              ? appointment.therapist_specialization.join(", ")
                              : "Therapy Session"}
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end", marginLeft: moderateScale(10) }}>
                          <Text style={styles.appointmentTime}>{appointment.appointment_date}</Text>
                          <Text
                            style={[styles.sessionInfo, { color: "#3C61DD", marginTop: hp(0.2) }]}
                            numberOfLines={1}
                          >
                            {appointment.time_slot}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.actionRow}
                        onPress={() =>
                          toast.info(
                            "Joining Session",
                            `Connecting you with ${appointment.therapist_name}...`,
                          )
                        }
                      >
                        <View style={styles.actionLeft}>
                          <Feather name="video" size={normalize(20)} color="#3C61DD" />
                          <Text style={[styles.actionText, { color: "#3C61DD" }]}>
                            Join Session
                          </Text>
                        </View>
                        <Feather name="chevron-right" size={normalize(18)} color="#3C61DD" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionRow, styles.noBorder]}
                        onPress={() =>
                          toast.info(
                            "Cancel Session",
                            "Please contact support to cancel your session.",
                          )
                        }
                      >
                        <View style={styles.actionLeft}>
                          <Feather name="alert-circle" size={normalize(20)} color="#E53935" />
                          <Text style={[styles.actionText, styles.cancelText]}>Cancel Session</Text>
                        </View>
                        <Feather name="chevron-right" size={normalize(18)} color="#A0A0A0" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
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
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3C61DD" />
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={fetchTherapistsAndAppointments}
                    >
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : therapists.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No therapists found</Text>
                  </View>
                ) : (
                  therapists.map((therapist) => (
                    <TouchableOpacity
                      key={therapist.id}
                      style={styles.therapistListItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        router.push({
                          pathname: "/therapist-details",
                          params: {
                            id: therapist.id.toString(),
                            therapistJson: JSON.stringify(therapist),
                          },
                        } as any);
                      }}
                    >
                      <View style={styles.therapistListLeft}>
                        <View style={styles.listAvatarContainer}>
                          {therapist.profile_photo ? (
                            <Image
                              source={{ uri: therapist.profile_photo }}
                              style={styles.avatar}
                            />
                          ) : (
                            <UserInitialsAvatar
                              name={therapist.full_name}
                              textSize={normalize(18)}
                            />
                          )}
                        </View>
                        <View style={styles.listInfo}>
                          <Text style={styles.therapistName}>{therapist.full_name}</Text>
                          <Text style={styles.ratingText}>
                            {therapist.average_rating > 0
                              ? `${therapist.average_rating.toFixed(1)} Rating`
                              : "0.0 Rating"}
                            {therapist.total_reviews > 0
                              ? ` (${therapist.total_reviews} reviews)`
                              : ""}
                          </Text>
                          <Text style={styles.specializationText} numberOfLines={2}>
                            {therapist.specialization && therapist.specialization.length > 0
                              ? `Specialized in ${therapist.specialization.join(", ")}`
                              : "General Practitioner"}
                          </Text>
                        </View>
                      </View>
                      <Feather name="chevron-right" size={normalize(24)} color="#A0A0A0" />
                    </TouchableOpacity>
                  ))
                )}
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
  loadingContainer: {
    paddingVertical: hp(4),
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    paddingVertical: hp(3),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 59, 48, 0.05)",
    borderRadius: normalize(12),
    paddingHorizontal: moderateScale(15),
  },
  errorText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: hp(1.5),
  },
  retryButton: {
    backgroundColor: "#3C61DD",
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(8),
    borderRadius: normalize(20),
  },
  retryText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(13),
    color: "#FFF",
  },
  emptyContainer: {
    paddingVertical: hp(4),
    alignItems: "center",
  },
  emptyText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#666",
  },
  appointmentEmptyCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  appointmentEmptyText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#666",
    textAlign: "center",
  },
});
