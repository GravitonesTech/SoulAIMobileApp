import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { ProgressHeader } from "@/components/ui/ProgressHeader";
import { GENDERS } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { ENDPOINTS } from "@/constants/endpoints";
import { apiClient } from "@/utils/api";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { toast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";
import { EntryAnimations } from "@/constants/Animations";
import { useFadeTransition } from "@/hooks/useFadeTransition";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GenderScreen() {
  const router = useRouter();
  const scrollRef = useRef<GestureScrollView>(null);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedGender, setSelectedGender] = useState("");

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [countriesList, setCountriesList] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { animatedStyle, navigateWithFade } = useFadeTransition(200);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.users.metadata);
        if (response.success && response.data?.countries) {
          const activeCountries = response.data.countries
            .filter((c: any) => c.is_active !== false)
            .map((c: any) => ({ id: c.id, name: c.name }));
          setCountriesList(activeCountries);
        }
      } catch (error) {
        console.error("[GenderScreen] Failed to fetch metadata countries:", error);
      }
    };
    fetchMetadata();
  }, []);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countriesList;
    return countriesList.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch, countriesList]);

  const handleCountryTextChange = (text: string) => {
    setCountrySearch(text);
    setShowCountryDropdown(true);
    const match = countriesList.find((c) => c.name.toLowerCase() === text.trim().toLowerCase());
    if (match) {
      setSelectedCountryId(match.id);
    } else {
      setSelectedCountryId(null);
    }
  };

  const handleCountrySelect = (item: { id: number; name: string }) => {
    setSelectedCountryId(item.id);
    setCountrySearch(item.name);
  };

  const handleNameChange = (text: string) => {
    // Keep only alphabetic characters and spaces
    const filtered = text.replace(/[^a-zA-Z\s]/g, "");
    setName(filtered);
  };

  const handleDobChange = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, "");

    let dayPart = cleaned.slice(0, 2);
    if (dayPart.length === 2) {
      const dayVal = parseInt(dayPart, 10);
      if (dayVal > 31) {
        dayPart = "31";
      } else if (dayVal === 0) {
        dayPart = "01";
      }
    }

    let monthPart = cleaned.slice(2, 4);
    if (monthPart.length === 2) {
      const monthVal = parseInt(monthPart, 10);
      if (monthVal > 12) {
        monthPart = "12";
      } else if (monthVal === 0) {
        monthPart = "01";
      }
    }

    let yearPart = cleaned.slice(4, 8);
    const today = new Date();
    const currentYear = today.getFullYear();
    if (yearPart.length === 4) {
      const yearVal = parseInt(yearPart, 10);
      if (yearVal > currentYear) {
        yearPart = currentYear.toString();
      }
    }

    // Re-assemble formatted text
    let formatted = dayPart;
    if (cleaned.length === 2 && text.length > dob.length) {
      formatted = `${dayPart}/`;
    } else if (cleaned.length > 2) {
      formatted = `${dayPart}/${monthPart}`;
    }

    if (cleaned.length === 4 && text.length > dob.length) {
      formatted = `${dayPart}/${monthPart}/`;
    } else if (cleaned.length > 4) {
      formatted = `${dayPart}/${monthPart}/${yearPart}`;
    }

    // Limit to DD/MM/YYYY length
    formatted = formatted.slice(0, 10);

    // If fully entered (10 characters), cap to latest valid date (today) if in the future
    // if (formatted.length === 10) {
    //   const [day, month, year] = formatted.split("/").map(Number);
    //   const typedDate = new Date(year, month - 1, day);
    //   if (typedDate > today) {
    //     const dd = String(today.getDate()).padStart(2, "0");
    //     const mm = String(today.getMonth() + 1).padStart(2, "0");
    //     const yyyy = today.getFullYear();
    //     formatted = `${dd}/${mm}/${yyyy}`;
    //   }
    // }

    setDob(formatted);
  };

  const validateDate = (dateString: string) => {
    if (dateString.length !== 10) return false;
    const [day, month, year] = dateString.split("/").map(Number);
    const d = new Date(year, month - 1, day);
    return (
      d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day &&
      d <= new Date()
    );
  };

  const is18Plus = (dateString: string) => {
    if (dateString.length !== 10) return false;
    const [day, month, year] = dateString.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 18;
  };

  const formatDobForAPI = (dateString: string) => {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  const handleNext = async () => {
    Keyboard.dismiss();

    if (!name.trim()) {
      toast.error("Error", "Please enter your full name");
      return;
    }
    if (!selectedGender) {
      toast.error("Error", "Please select your gender");
      return;
    }
    if (!dob.trim()) {
      toast.error("Error", "Please enter your date of birth");
      return;
    }
    if (!validateDate(dob)) {
      toast.error("Error", "Please enter a valid date of birth (DD/MM/YYYY)");
      return;
    }
    if (!is18Plus(dob)) {
      toast.error("Age Restriction", "You must be 18 years or older to use Soul AI.");
      return;
    }
    if (!selectedCountryId) {
      toast.error("Error", "Please select a valid country from the list");
      return;
    }

    setIsLoading(true);
    const result = await apiClient.patch(ENDPOINTS.users.me, {
      full_name: name,
      country: selectedCountryId,
      date_of_birth: formatDobForAPI(dob),
      gender: selectedGender,
      completed_step: 1,
    });

    if (result.success) {
      navigateWithFade("/onboarding_two", { replace: true });
    } else {
      if (result.status === 401) {
        toast.error("Session Expired", "Please login again.");
        navigateWithFade("/", { replace: true });
      } else {
        toast.error("Update Failed", result.message);
      }
    }

    setIsLoading(false);
  };

  const renderCountryDropdown = (
    options: { id: number; name: string }[],
    onSelect: (item: { id: number; name: string }) => void,
    visible: boolean,
    onClose: () => void,
  ) => {
    if (!visible || options.length === 0) return null;
    return (
      <View style={styles.dropdownContainer}>
        <GestureScrollView
          style={{ maxHeight: moderateScale(250) }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.dropdownOption}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <Text style={styles.dropdownOptionText}>{option.name}</Text>
            </TouchableOpacity>
          ))}
        </GestureScrollView>
      </View>
    );
  };

  const renderDropdown = (
    options: string[],
    onSelect: (val: string) => void,
    visible: boolean,
    onClose: () => void,
  ) => {
    if (!visible || options.length === 0) return null;
    return (
      <View style={styles.dropdownContainer}>
        <GestureScrollView
          style={{ maxHeight: moderateScale(250) }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownOption}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <Text style={styles.dropdownOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </GestureScrollView>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 40}
          >
            <ProgressHeader progress="45%" onBack={() => router.back()} />

            <GestureScrollView
              ref={scrollRef}
              contentContainerStyle={styles.scrollContainer}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <Animated.View entering={EntryAnimations.header} style={styles.header}>
                <Text style={styles.titleText}>What’s your name?</Text>
                <Text style={styles.subtitleText}>Let us know more about you</Text>
              </Animated.View>

              {/* Input Field Form */}
              <Animated.View entering={EntryAnimations.formContainer} style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <AppInput
                    placeholder="Full Name"
                    value={name}
                    onChangeText={handleNameChange}
                    style={styles.inputStyle}
                  />
                </View>

                <View style={[styles.inputWrapper, { zIndex: 10 }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.fullWidth}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowGenderDropdown(!showGenderDropdown);
                      setShowCountryDropdown(false);
                    }}
                  >
                    <AppInput
                      placeholder="Gender"
                      value={selectedGender}
                      style={styles.inputStyle}
                      editable={false}
                      pointerEvents="none"
                      rightIcon={
                        <Feather
                          name={showGenderDropdown ? "chevron-up" : "chevron-down"}
                          size={normalize(20)}
                          color="#8A8A8E"
                        />
                      }
                    />
                  </TouchableOpacity>
                  {renderDropdown(GENDERS, setSelectedGender, showGenderDropdown, () =>
                    setShowGenderDropdown(false),
                  )}
                </View>

                <View style={styles.inputWrapper}>
                  <AppInput
                    placeholder="Date of Birth (DD/MM/YYYY)"
                    value={dob}
                    onChangeText={handleDobChange}
                    keyboardType="numeric"
                    style={styles.inputStyle}
                    maxLength={10}
                    // rightIcon={<Feather name="calendar" size={normalize(20)} color="#8A8A8E" />}
                  />
                  {dob.length === 10 && !is18Plus(dob) && (
                    <Text style={styles.warningText}>You must be 18 years or older.</Text>
                  )}
                </View>

                <View style={[styles.inputWrapper, { zIndex: 5 }]}>
                  <AppInput
                    placeholder="Country"
                    value={countrySearch}
                    onChangeText={handleCountryTextChange}
                    onFocus={() => {
                      setShowCountryDropdown(true);
                      setTimeout(() => {
                        scrollRef.current?.scrollToEnd({ animated: true });
                      }, 100);
                    }}
                    style={styles.inputStyle}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => {
                          const nextVisible = !showCountryDropdown;
                          setShowCountryDropdown(nextVisible);
                          if (nextVisible) {
                            setTimeout(() => {
                              scrollRef.current?.scrollToEnd({ animated: true });
                            }, 100);
                          }
                        }}
                      >
                        <Feather
                          name={showCountryDropdown ? "chevron-up" : "chevron-down"}
                          size={normalize(20)}
                          color="#8A8A8E"
                        />
                      </TouchableOpacity>
                    }
                  />
                  {renderCountryDropdown(
                    filteredCountries,
                    handleCountrySelect,
                    showCountryDropdown,
                    () => setShowCountryDropdown(false),
                  )}
                </View>

                <AppButton
                  title="Next"
                  isLoading={isLoading}
                  onPress={handleNext}
                  style={{ marginTop: hp(3) }}
                />
                {showCountryDropdown && <View style={{ height: moderateScale(10) }} />}
              </Animated.View>
            </GestureScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(28),
    paddingBottom: moderateScale(56),
  },
  header: {
    alignItems: "center",
    marginBottom: hp(6),
    // marginTop: hp(10),
  },
  titleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(34),
    color: "#111111",
    textAlign: "center",
    marginBottom: hp(1),
  },
  subtitleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(18),
    color: "#8A8A8E",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    paddingBottom: moderateScale(40),
  },
  inputWrapper: {
    width: "100%",
    position: "relative",
    marginBottom: hp(2),
  },
  fullWidth: {
    width: "100%",
  },
  inputStyle: {
    marginBottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderColor: "rgba(0,0,0,0.02)",
    borderRadius: normalize(12),
    height: moderateScale(60),
  },
  dropdownContainer: {
    position: "absolute",
    top: moderateScale(62),
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownOption: {
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  dropdownOptionText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(16),
    color: "#333333",
  },
  warningText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#FF3B30",
    marginTop: moderateScale(4),
    marginLeft: moderateScale(4),
  },
});
