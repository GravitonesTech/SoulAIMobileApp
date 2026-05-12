import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Typography } from "@/constants/Typography";
import { ENDPOINTS } from "@/constants/endpoints";
import { apiClient } from "@/utils/api";
import { toast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressHeader } from "@/components/ui/ProgressHeader";
import { COUNTRIES, GENDERS } from "@/constants/StaticData";
import { hp, moderateScale, normalize } from "@/utils/responsive";

export default function GenderScreen() {
  const router = useRouter();
  const scrollRef = useRef<GestureScrollView>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedGender, setSelectedGender] = useState("");

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COUNTRIES;
    return COUNTRIES.filter((c) => c.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch]);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDateForAPI = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDateForDisplay = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = String(date.getFullYear()).slice(-2);
    return `${d}/${m}/${y}`;
  };

  const handleNext = async () => {
    if (!name.trim()) {
      toast.error("Error", "Please enter your full name");
      return;
    }
    if (!selectedGender) {
      toast.error("Error", "Please select your gender");
      return;
    }
    if (!date) {
      toast.error("Error", "Please select your date of birth");
      return;
    }
    if (!countrySearch.trim()) {
      toast.error("Error", "Please select your country");
      return;
    }

    setIsLoading(true);
    const result = await apiClient.patch(ENDPOINTS.users.me, {
      full_name: name,
      country: countrySearch,
      date_of_birth: formatDateForAPI(date),
      gender: selectedGender,
      completed_step: 1,
    });

    if (result.success) {
      router.replace("/onboarding_two");
    } else {
      if (result.status === 401) {
        toast.error("Session Expired", "Please login again.");
        router.replace("/");
      } else {
        toast.error("Update Failed", result.message);
      }
    }

    setIsLoading(false);
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
            <View style={styles.header}>
              <Text style={styles.titleText}>What’s your name?</Text>
              <Text style={styles.subtitleText}>Let us know more about you</Text>
            </View>

            {/* Input Field Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <AppInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
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
                <TouchableOpacity activeOpacity={1} onPress={() => setShowDatePicker(true)}>
                  <AppInput
                    placeholder="Date of Birth (DD/MM/YY)"
                    value={date ? formatDateForDisplay(date) : ""}
                    style={styles.inputStyle}
                    editable={false}
                    pointerEvents="none"
                    rightIcon={<Feather name="calendar" size={normalize(20)} color="#8A8A8E" />}
                  />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}

              <View style={[styles.inputWrapper, { zIndex: 5 }]}>
                <AppInput
                  placeholder="Country"
                  value={countrySearch}
                  onChangeText={(text) => {
                    setCountrySearch(text);
                    setShowCountryDropdown(true);
                  }}
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
                {renderDropdown(filteredCountries, setCountrySearch, showCountryDropdown, () =>
                  setShowCountryDropdown(false),
                )}
              </View>

              <AppButton
                title="Next"
                isLoading={isLoading}
                onPress={handleNext}
                style={{ marginTop: hp(3) }}
              />
              {showCountryDropdown && <View style={{ height: moderateScale(10) }} />}
            </View>
          </GestureScrollView>
        </KeyboardAvoidingView>
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
});
