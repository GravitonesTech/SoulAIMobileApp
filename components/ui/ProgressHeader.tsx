import { moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { DimensionValue, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

interface ProgressHeaderProps {
  /**
   * Progress value as a percentage (e.g., "13%" or 13)
   */
  progress: string | number;
  /**
   * Callback function when back button is pressed
   */
  onBack: () => void;
}

/**
 * Standardized header with a back button and progress track for onboarding screens.
 */
export const ProgressHeader = ({ progress, onBack }: ProgressHeaderProps) => {
  return (
    <View style={styles.topNavContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Feather name="arrow-left" size={normalize(24)} color="#111111" />
      </TouchableOpacity>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: (typeof progress === "number" ? `${progress}%` : progress) as DimensionValue },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topNavContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    paddingTop: Platform.OS === "android" ? moderateScale(36) : moderateScale(16),
    paddingBottom: moderateScale(24),
    width: "100%",
  },
  backButton: {
    padding: moderateScale(4),
    marginRight: wp(4),
  },
  progressTrack: {
    flex: 1,
    height: normalize(6),
    backgroundColor: "rgba(60, 97, 221, 0.1)",
    borderRadius: normalize(2),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3C61DD",
    borderRadius: normalize(10),
  },
});
