import { RecentTherapistCard } from "@/components/therapist/RecentTherapistCard";
import { TherapistFilterModal } from "@/components/therapist/TherapistFilterModal";
import { TherapistListItem } from "@/components/therapist/TherapistListItem";
import { TherapistSearchBar } from "@/components/therapist/TherapistSearchBar";
import { TopTherapistsList } from "@/components/therapist/TopTherapistsList";
import { UpcomingAppointments } from "@/components/therapist/UpcomingAppointments";
import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { useAppConfirmation } from "@/hooks/useAppConfirmation";
import { Appointment, Therapist } from "@/types/therapist";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HumanTherapistsScreen() {
  const router = useRouter();
  const { from, sessionId, therapy, selected_therapy, showNewChatButton } = useLocalSearchParams<{
    from?: string;
    sessionId?: string;
    therapy?: string;
    selected_therapy?: string;
    showNewChatButton?: string;
  }>();
  const { showConfirmation } = useAppConfirmation();
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [searchedTherapists, setSearchedTherapists] = useState<Therapist[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    therapy: "All Therapy Types",
    availability: "Any time",
    experience: 1,
    rating: "Any rating",
  });

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [therapyOptions, setTherapyOptions] = useState<string[]>(["All Therapy Types"]);

  // Fetch therapy options on mount
  useEffect(() => {
    const fetchTherapies = async () => {
      try {
        const response = await apiClient.get<Array<{ name: string }>>(ENDPOINTS.master.therapies);
        if (response.success && response.data) {
          const names = response.data.map((t) => t.name);
          setTherapyOptions(["All Therapy Types", ...names]);
        }
      } catch (err) {
        console.warn("Failed to fetch therapies master:", err);
      }
    };
    fetchTherapies();
  }, []);

  const handleOpenFilter = () => {
    setIsFilterVisible(true);
  };

  const handleCancelFilter = () => {
    setIsFilterVisible(false);
  };

  const handleApplyFilter = (filters: typeof activeFilters) => {
    setActiveFilters(filters);
    setIsFilterVisible(false);
  };

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
      setPastAppointments(appointmentsRes.value.data.past || []);
    }
    setIsAppointmentsLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTherapistsAndAppointments();
    setRefreshing(false);
  }, [fetchTherapistsAndAppointments]);

  useFocusEffect(
    useCallback(() => {
      fetchTherapistsAndAppointments();
    }, [fetchTherapistsAndAppointments]),
  );

  const performSearch = useCallback(async (query: string, filters: typeof activeFilters) => {
    const trimmed = query.trim();
    const hasActiveFilters =
      filters.therapy !== "All Therapy Types" ||
      filters.availability !== "Any time" ||
      filters.experience > 1 ||
      filters.rating !== "Any rating";

    if (!trimmed && !hasActiveFilters) {
      setSearchedTherapists([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const params: any = {
        page: 1,
        page_size: 10,
      };

      if (trimmed) {
        params.search_query = trimmed;
      }
      if (filters.therapy !== "All Therapy Types") {
        params.therapy_type = filters.therapy;
      }
      if (filters.availability !== "Any time") {
        params.available_time = filters.availability;
      }
      if (filters.experience > 1) {
        params.experience_level = filters.experience;
      }
      if (filters.rating !== "Any rating") {
        const ratingVal = parseFloat(filters.rating.split(" ")[0]);
        if (!isNaN(ratingVal)) {
          params.min_rating = ratingVal;
        }
      }

      const response = await apiClient.get<{
        total_count: number;
        page: number;
        page_size: number;
        total_pages: number;
        therapists: Therapist[];
      }>(ENDPOINTS.users.getAllTherapists, { params });

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
    const hasActiveFilters =
      activeFilters.therapy !== "All Therapy Types" ||
      activeFilters.availability !== "Any time" ||
      activeFilters.experience > 1 ||
      activeFilters.rating !== "Any rating";

    if (searchText.trim() || hasActiveFilters) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
      setSearchedTherapists([]);
      setSearchError(null);
    }

    const handler = setTimeout(() => {
      performSearch(searchText, activeFilters);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, activeFilters, performSearch]);

  const hasActiveFilters =
    activeFilters.therapy !== "All Therapy Types" ||
    activeFilters.availability !== "Any time" ||
    activeFilters.experience > 1 ||
    activeFilters.rating !== "Any rating";

  const showSearchResults = searchText.length > 0 || hasActiveFilters;

  const navigateToTherapistDetails = (therapist: Therapist) => {
    setSearchText("");
    router.push({
      pathname: "/therapist-details",
      params: {
        id: therapist.id.toString(),
        therapistJson: JSON.stringify(therapist),
      },
    } as any);
  };

  const handleJoinSession = (appointment: Appointment) => {
    let zoomUrl = appointment.meeting_url || "";
    if (!zoomUrl && appointment.notes && appointment.notes.includes("zoom.us")) {
      const match = appointment.notes.match(/https?:\/\/[^\s]+/);
      if (match) zoomUrl = match[0];
    }

    if (!zoomUrl && !appointment.meeting_id) {
      // Fallback zoom link with mock meeting ID and passcode
      zoomUrl = `https://zoom.us/j/1234567890?pwd=mock_passcode_${appointment.id}`;
    }

    toast.info("Joining Session", `Connecting you with ${appointment.therapist_name}...`);

    router.push({
      pathname: "/zoom-meeting",
      params: {
        meetingId: appointment.meeting_id || "",
        meetingPassword: appointment.meeting_password || "",
        meetingUrl: zoomUrl,
        therapistName: appointment.therapist_name,
        patientName: appointment.patient_name || "Patient",
        sdkSignature: appointment.sdk_signature || "",
        therapistId: appointment.therapist_id.toString(),
        bookingId: appointment.id.toString(),
        therapistPhoto: appointment.therapist_photo || "",
        therapistSpecialization: appointment.therapist_specialization
          ? appointment.therapist_specialization.join(", ")
          : "",
      },
    } as any);
  };

  const handleCancelSession = (appointment: Appointment) => {
    showConfirmation(
      "Cancel Session",
      `Are you sure you want to cancel your session with ${appointment.therapist_name}?`,
      async () => {
        try {
          setIsAppointmentsLoading(true);
          const response = await apiClient.post<any>(
            ENDPOINTS.users.cancelAppointment(appointment.id),
            {},
          );
          if (response.success) {
            toast.success(
              "Cancelled",
              response.message || "Your appointment has been cancelled successfully.",
            );
            fetchTherapistsAndAppointments();
          } else {
            toast.error("Cancel Failed", response.message || "Failed to cancel appointment.");
          }
        } catch (err) {
          console.error("Error cancelling appointment:", err);
          toast.error("Error", "Could not connect to the server.");
        } finally {
          setIsAppointmentsLoading(false);
        }
      },
      {
        cancelLabel: "No",
        confirmLabel: "Yes, Cancel",
      },
    );
  };

  const handleRecentTherapistPress = async (appointment: Appointment) => {
    // 1. Check if the therapist is already in our loaded `therapists` list (top-rated)
    const existing = therapists.find((t) => t.id === appointment.therapist_id);
    if (existing) {
      navigateToTherapistDetails(existing);
      return;
    }

    // 2. Otherwise, fetch/lookup from all therapists
    try {
      const params = {
        page: 1,
        page_size: 10,
        search_query: appointment.therapist_name.trim(),
      };
      const response = await apiClient.get<{
        therapists: Therapist[];
      }>(ENDPOINTS.users.getAllTherapists, { params });

      if (response.success && response.data?.therapists) {
        const found = response.data.therapists.find((t) => t.id === appointment.therapist_id);
        if (found) {
          navigateToTherapistDetails(found);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to lookup therapist details:", err);
    }

    // 3. Fallback: construct a partial Therapist object so it doesn't fail
    const fallbackTherapist: Therapist = {
      id: appointment.therapist_id,
      email: appointment.patient_email || "",
      full_name: appointment.therapist_name,
      phone: null,
      profile_photo: appointment.therapist_photo,
      license_number: null,
      specialization: appointment.therapist_specialization || [],
      experience_years: 1,
      bio: "Professional therapist specialized in supporting you.",
      clinic_address: null,
      is_approved: true,
      average_rating: 4.5,
      total_reviews: 0,
      schedules: [],
    };
    navigateToTherapistDetails(fallbackTherapist);
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#FFFFFF", "#E2F4FF"]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          {/* Header */}
          <AppHeader
            leftIcon="arrow-left"
            title="Human Therapists"
            onLeftPress={() => {
              if (from === "chat") {
                router.push({
                  pathname: "/(drawer)/chat",
                  params: {
                    sessionId,
                    therapy,
                    selected_therapy,
                    showNewChatButton,
                  },
                } as any);
              } else {
                router.back();
              }
            }}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            alwaysBounceVertical={true}
            overScrollMode="always"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3C61DD"]}
                tintColor="#3C61DD"
              />
            }
          >
            {/* Search Bar */}
            <TherapistSearchBar
              value={searchText}
              onChangeText={setSearchText}
              isFocused={isFocused}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmit={() => performSearch(searchText, activeFilters)}
              showClear={searchText.length > 0}
              onClear={() => setSearchText("")}
              onFilterPress={handleOpenFilter}
            />

            {hasActiveFilters && (
              <View style={styles.activeFiltersRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.activeFiltersScroll}
                >
                  {activeFilters.therapy !== "All Therapy Types" && (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>{activeFilters.therapy}</Text>
                    </View>
                  )}
                  {activeFilters.availability !== "Any time" && (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>{activeFilters.availability}</Text>
                    </View>
                  )}
                  {activeFilters.experience > 1 && (
                    <View style={styles.filterChip}>
                      <Text
                        style={styles.filterChipText}
                      >{`>= ${activeFilters.experience} yrs`}</Text>
                    </View>
                  )}
                  {activeFilters.rating !== "Any rating" && (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>{`${activeFilters.rating}`}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() =>
                      setActiveFilters({
                        therapy: "All Therapy Types",
                        availability: "Any time",
                        experience: 1,
                        rating: "Any rating",
                      })
                    }
                    style={styles.clearFiltersChip}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearFiltersChipText}>Clear All</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            {isLoading && therapists.length === 0 && upcomingAppointments.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3C61DD" />
              </View>
            ) : showSearchResults ? (
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
                      onPress={() => performSearch(searchText, activeFilters)}
                    >
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : searchedTherapists.length === 0 ? (
                  <>
                    <View style={styles.noResultContainer}>
                      <Text style={styles.noResultTitle}>No results found</Text>
                      <Text style={styles.noResultSubtitle}>
                        {`No results match your criteria. Please clear filters or search for another keyword.`}
                      </Text>
                    </View>
                    <TopTherapistsList
                      therapists={therapists}
                      isLoading={isLoading && therapists.length === 0 && !refreshing}
                      error={error}
                      onRetry={fetchTherapistsAndAppointments}
                      onTherapistPress={navigateToTherapistDetails}
                    />
                  </>
                ) : (
                  searchedTherapists.map((therapist) => (
                    <TherapistListItem
                      key={therapist.id}
                      therapist={therapist}
                      onPress={() => navigateToTherapistDetails(therapist)}
                    />
                  ))
                )}
              </View>
            ) : (
              <>
                {/* Upcoming Appointment */}
                <UpcomingAppointments
                  appointments={upcomingAppointments}
                  isLoading={
                    isAppointmentsLoading && upcomingAppointments.length === 0 && !refreshing
                  }
                  onJoinSession={handleJoinSession}
                  onCancelSession={handleCancelSession}
                />

                {/* Recent */}
                {pastAppointments.length > 0 ? (
                  <RecentTherapistCard
                    therapistName={pastAppointments[0].therapist_name}
                    therapistPhoto={pastAppointments[0].therapist_photo}
                    specialization={pastAppointments[0].therapist_specialization}
                    rating={
                      therapists.find((t) => t.id === pastAppointments[0].therapist_id)
                        ?.average_rating
                    }
                    onPress={() => handleRecentTherapistPress(pastAppointments[0])}
                  />
                ) : (
                  <RecentTherapistCard isEmpty={true} />
                )}

                {/* Top Therapists */}
                <TopTherapistsList
                  therapists={therapists}
                  isLoading={isLoading && therapists.length === 0 && !refreshing}
                  error={error}
                  onRetry={fetchTherapistsAndAppointments}
                  onTherapistPress={navigateToTherapistDetails}
                />
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* FILTER MODAL */}
      <TherapistFilterModal
        visible={isFilterVisible}
        onClose={handleCancelFilter}
        activeFilters={activeFilters}
        onApply={handleApplyFilter}
        therapyOptions={therapyOptions}
      />
    </View>
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
    flexGrow: 1,
    paddingHorizontal: moderateScale(20),
    paddingBottom: hp(4),
  },
  searchResultsContainer: {
    marginTop: hp(1),
  },
  noResultContainer: {
    alignItems: "center",
    marginTop: hp(4),
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
  activeFiltersRow: {
    marginTop: hp(1),
    marginBottom: hp(0.5),
  },
  activeFiltersScroll: {
    paddingLeft: moderateScale(4),
    alignItems: "center",
  },
  filterChip: {
    backgroundColor: "#E2F4FF",
    borderRadius: normalize(12),
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(12),
    marginRight: moderateScale(8),
    borderWidth: 1,
    borderColor: "#CCE5FF",
  },
  filterChipText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#3C61DD",
  },
  clearFiltersChip: {
    backgroundColor: "#FFF",
    borderRadius: normalize(12),
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(12),
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  clearFiltersChipText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#FF3B30",
  },
});
