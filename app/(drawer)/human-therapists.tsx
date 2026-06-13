import { RecentTherapistCard } from "@/components/therapist/RecentTherapistCard";
import { TherapistListItem } from "@/components/therapist/TherapistListItem";
import { TherapistSearchBar } from "@/components/therapist/TherapistSearchBar";
import { TopTherapistsList } from "@/components/therapist/TopTherapistsList";
import { UpcomingAppointments } from "@/components/therapist/UpcomingAppointments";
import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { Appointment, Therapist } from "@/types/therapist";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    toast.info("Joining Session", `Connecting you with ${appointment.therapist_name}...`);
  };

  const handleCancelSession = (appointment: Appointment) => {
    toast.info("Cancel Session", "Please contact support to cancel your session.");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
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
              <TherapistSearchBar
                value={searchText}
                onChangeText={setSearchText}
                isFocused={isFocused}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onSubmit={() => performSearch(searchText)}
                showClear={searchText.length > 0}
                onClear={() => setSearchText("")}
              />

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
                    <>
                      <View style={styles.noResultContainer}>
                        <Text style={styles.noResultTitle}>No results found</Text>
                        <Text style={styles.noResultSubtitle}>
                          {`No result found for “${searchText}” Please find another keyword or browse our top therapists below.`}
                        </Text>
                      </View>
                      <TopTherapistsList
                        therapists={therapists}
                        isLoading={isLoading}
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
                    isLoading={isAppointmentsLoading}
                    onJoinSession={handleJoinSession}
                    onCancelSession={handleCancelSession}
                  />

                  {/* Recent */}
                  <RecentTherapistCard />

                  {/* Top Therapists */}
                  <TopTherapistsList
                    therapists={therapists}
                    isLoading={isLoading}
                    error={error}
                    onRetry={fetchTherapistsAndAppointments}
                    onTherapistPress={navigateToTherapistDetails}
                  />
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
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
});
