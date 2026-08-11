import { AvailabilitySlots } from "@/components/therapist/AvailabilitySlots";
import { BookingButton } from "@/components/therapist/BookingButton";
import { RatingsSummary } from "@/components/therapist/RatingsSummary";
import { SpecialtiesList } from "@/components/therapist/SpecialtiesList";
import { TherapistHeaderInfo } from "@/components/therapist/TherapistHeaderInfo";
import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { ReviewFromApi, Therapist } from "@/types/therapist";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatReviewTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      if (diffHours <= 0) {
        return "Just now";
      }
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Some time ago";
  }
};

export default function TherapistDetailsScreen() {
  const router = useRouter();
  const { therapistJson, showReview, bookingId, hasReviewed } = useLocalSearchParams<{
    therapistJson?: string;
    showReview?: string;
    bookingId?: string;
    hasReviewed?: string;
  }>();

  const therapist = useMemo<Therapist | null>(() => {
    if (!therapistJson) return null;
    try {
      return JSON.parse(therapistJson);
    } catch {
      return null;
    }
  }, [therapistJson]);

  // State for selected slot
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    slot: string;
    date?: string;
  } | null>(null);

  const [startDate, setStartDate] = useState<Date>(() => new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });

  const [showPicker, setShowPicker] = useState<"start" | "end" | null>(null);

  const maxCustomDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d;
  }, []);

  const onChangeStartDate = (event: any, selectedDate?: Date) => {
    setShowPicker(null);
    if (selectedDate) {
      setStartDate(selectedDate);
      setSelectedSlot(null);
      if (endDate < selectedDate) {
        const nextEnd = new Date(selectedDate);
        nextEnd.setDate(nextEnd.getDate() + 7);
        setEndDate(nextEnd);
      }
    }
  };

  const onChangeEndDate = (event: any, selectedDate?: Date) => {
    setShowPicker(null);
    if (selectedDate) {
      if (selectedDate < startDate) {
        toast.error("Invalid Date Range", "End date cannot be before start date.");
        return;
      }
      setEndDate(selectedDate);
      setSelectedSlot(null);
    }
  };

  const [loadedTherapist, setLoadedTherapist] = useState<Therapist | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const displayTherapist = loadedTherapist || therapist;

  useEffect(() => {
    if (therapist) {
      setLoadedTherapist(therapist);
    }
  }, [therapist]);

  useEffect(() => {
    if (!therapist?.id) return;
    const fetchTherapistDetails = async () => {
      setLoadingDetails(true);
      try {
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const startStr = formatDate(startDate);
        const endStr = formatDate(endDate);

        const response = await apiClient.get<Therapist>(
          ENDPOINTS.users.therapistDetails(therapist.id),
          {
            params: {
              start_date: startStr,
              end_date: endStr,
            },
          },
        );
        if (response.success && response.data) {
          setLoadedTherapist(response.data);
        }
      } catch (err) {
        console.warn("Failed to fetch therapist details:", err);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchTherapistDetails();
  }, [therapist?.id, startDate, endDate]);

  const [reviews, setReviews] = useState<
    {
      author: string;
      time: string;
      rating: number;
      content: string;
      photo: string | null;
    }[]
  >([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (!displayTherapist) return;
    const fetchReviews = async () => {
      try {
        const response = await apiClient.get<ReviewFromApi[]>(
          ENDPOINTS.users.reviews(displayTherapist.id),
        );
        if (response.success && response.data) {
          const mappedReviews = response.data.map((r) => ({
            author: r.patient_name || "Anonymous User",
            time: formatReviewTime(r.created_at),
            rating: r.rating,
            content: r.review_text,
            photo: r.patient_photo,
          }));
          setReviews(mappedReviews);
        }
      } catch (err) {
        console.warn("Failed to fetch reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [displayTherapist?.id]);

  // Generate reviews for presentation
  const reviewsToDisplay = useMemo(() => {
    if (loadingReviews || !displayTherapist || displayTherapist.total_reviews === 0) return [];
    return reviews;
  }, [reviews, loadingReviews, displayTherapist?.total_reviews]);

  if (!displayTherapist) {
    return (
      <View style={styles.loadingScreen}>
        <AppHeader leftIcon="arrow-left" title="Therapist Details" />
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
        {/* Header */}
        <AppHeader leftIcon="arrow-left" title={displayTherapist.full_name} showAvatar={true} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Therapist Hero / Header Info */}
          <TherapistHeaderInfo
            therapist={displayTherapist}
            hideSpecialization={showReview === "true" || hasReviewed === "true"}
          />

          {/* Specialties Section */}
          {showReview !== "true" && hasReviewed !== "true" && (
            <SpecialtiesList specializations={displayTherapist.specialization} />
          )}

          {showReview === "true" && (
            <View style={styles.reviewPromptCard}>
              <View style={styles.reviewPromptHeader}>
                <Feather name="star" size={normalize(20)} color="#FFC107" />
                <Text style={styles.reviewPromptTitle}>Rate your recent session</Text>
              </View>
              <Text style={styles.reviewPromptText}>
                Share your feedback to help others and improve our services.
              </Text>
              <TouchableOpacity
                style={styles.reviewPromptBtn}
                onPress={() => {
                  router.push({
                    pathname: "/review-session",
                    params: {
                      therapistId: displayTherapist.id.toString(),
                      therapistName: displayTherapist.full_name,
                      therapistSpecialization: displayTherapist.specialization
                        ? displayTherapist.specialization.join(", ")
                        : "",
                      therapistPhoto: displayTherapist.profile_photo || "",
                      bookingId: bookingId || "",
                    },
                  } as any);
                }}
              >
                <Text style={styles.reviewPromptBtnText}>Write a Review</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasReviewed === "true" && (
            <View
              style={[
                styles.reviewPromptCard,
                { borderColor: "#CCE5FF", backgroundColor: "#F2F9FF" },
              ]}
            >
              <View style={styles.reviewPromptHeader}>
                <Feather name="check-circle" size={normalize(20)} color="#3C61DD" />
                <Text style={styles.reviewPromptTitle}>Review Submitted</Text>
              </View>
              <Text style={[styles.reviewPromptText, { marginBottom: 0 }]}>
                You have already reviewed this therapist. Thank you for your feedback!
              </Text>
            </View>
          )}

          {/* Date Range Selector */}
          {showReview !== "true" && hasReviewed !== "true" && (
            <>
              <View style={styles.dateSelectorContainer}>
                <Text style={styles.dateSelectorLabel}>CHOOSE DATE RANGE</Text>
                <View style={styles.dateButtonsRow}>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowPicker("start")}
                    activeOpacity={0.7}
                  >
                    <Feather name="calendar" size={16} color="#3C61DD" />
                    <View style={styles.dateButtonTextContainer}>
                      <Text style={styles.dateButtonSublabel}>Start Date</Text>
                      <Text style={styles.dateButtonText}>
                        {startDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowPicker("end")}
                    activeOpacity={0.7}
                  >
                    <Feather name="calendar" size={16} color="#3C61DD" />
                    <View style={styles.dateButtonTextContainer}>
                      <Text style={styles.dateButtonSublabel}>End Date</Text>
                      <Text style={styles.dateButtonText}>
                        {endDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {showPicker === "start" && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  maximumDate={maxCustomDate}
                  onChange={onChangeStartDate}
                />
              )}

              {showPicker === "end" && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  minimumDate={startDate}
                  maximumDate={maxCustomDate}
                  onChange={onChangeEndDate}
                />
              )}
            </>
          )}

          {/* Availability Slots Section */}
          {showReview !== "true" && hasReviewed !== "true" && (
            <AvailabilitySlots
              availability={displayTherapist.availability}
              selectedSlot={selectedSlot}
              onChangeSlot={setSelectedSlot}
              loading={loadingDetails && !displayTherapist.availability}
            />
          )}

          {/* Ratings Section */}
          <RatingsSummary
            averageRating={displayTherapist.average_rating}
            totalReviews={displayTherapist.total_reviews}
            reviews={reviewsToDisplay}
          />
        </ScrollView>

        {/* Floating/Sticky Action Button at Bottom Right */}
        {showReview !== "true" && hasReviewed !== "true" && (
          <BookingButton
            text="Book Session"
            onPress={() => {
              if (!selectedSlot) {
                toast.error("Slot Required", "Please select an availability slot first.");
                return;
              }
              router.push({
                pathname: "/book-session",
                params: {
                  therapistJson: JSON.stringify(displayTherapist),
                  selectedSlotJson: JSON.stringify(selectedSlot),
                },
              });
            }}
          />
        )}
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
    paddingBottom: hp(12),
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
  dateSelectorContainer: {
    marginBottom: hp(2.5),
  },
  dateSelectorLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#666",
    marginBottom: hp(1.2),
    letterSpacing: 0.5,
  },
  dateButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: moderateScale(12),
  },
  datePickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(14),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    borderWidth: 1,
    borderColor: "#E2F4FF",
    gap: moderateScale(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  dateButtonTextContainer: {
    flex: 1,
  },
  dateButtonSublabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(10),
    color: "#8A8A8E",
  },
  dateButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(12),
    color: "#333333",
    marginTop: hp(0.2),
  },
  reviewPromptCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    marginBottom: hp(2.5),
    borderWidth: 1,
    borderColor: "#E2F4FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewPromptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.8),
    gap: moderateScale(8),
  },
  reviewPromptTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#111111",
  },
  reviewPromptText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#666666",
    lineHeight: normalize(18),
    marginBottom: hp(1.8),
  },
  reviewPromptBtn: {
    backgroundColor: "#3C61DD",
    borderRadius: normalize(10),
    paddingVertical: hp(1.2),
    alignItems: "center",
    justifyContent: "center",
  },
  reviewPromptBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(13),
    color: "#FFFFFF",
  },
});
