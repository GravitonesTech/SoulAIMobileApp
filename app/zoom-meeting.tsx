import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import {
  addZoomEventListener,
  useZoom,
  ZoomSDKEvent,
  ZoomSDKProvider,
} from "@zoom/meetingsdk-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ZoomMeetingInnerProps {
  meetingNumber: string;
  password?: string;
  userName: string;
  onLeave: () => void;
}

function ZoomMeetingInner({ meetingNumber, password, userName, onLeave }: ZoomMeetingInnerProps) {
  const zoom = useZoom();
  const [meetingState, setMeetingState] = useState<string>("Initializing...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Subscribe to Zoom events
    console.log("AuthReturn of Zoom events", ZoomSDKEvent.AuthReturn);
    const authSub = addZoomEventListener(ZoomSDKEvent.AuthReturn, (event) => {
      console.log("Zoom Auth Return event:", event);
      if (event.error === "MobileRTCAuthError_Success" || event.error === "ZOOM_ERROR_SUCCESS") {
        setMeetingState("Authorized. Joining meeting...");
        joinMeeting();
      } else {
        setErrorMessage(`Authorization Failed: ${event.error}`);
        setMeetingState("Failed");
      }
    });

    const stateSub = addZoomEventListener(ZoomSDKEvent.MeetingStateChange, (event) => {
      console.log("Zoom Meeting State Changed event:", event.state);
      setMeetingState(event.state);
      if (
        event.state === "MobileRTCMeetingState_Ended" ||
        event.state === "Ended" ||
        event.state === "MobileRTCMeetingState_Idle" ||
        event.state === "Idle"
      ) {
        // Safe exit
        onLeave();
      }
    });

    const errorSub = addZoomEventListener(ZoomSDKEvent.MeetingError, (event) => {
      console.error("Zoom Meeting Error event:", event);
      setErrorMessage(event.message || `Meeting Error: ${event.error}`);
      setMeetingState("Failed");
    });

    // 2. Check if SDK is already initialized
    zoom
      .isInitialized()
      .then((initialized) => {
        if (initialized) {
          setMeetingState("SDK Ready. Joining meeting...");
          joinMeeting();
        } else {
          setMeetingState("Authorizing SDK...");
        }
      })
      .catch((err) => {
        console.error("Error checking Zoom SDK status:", err);
        setMeetingState("Authorizing SDK...");
      });

    const joinMeeting = async () => {
      try {
        // Disable pre-meeting preview screen
        zoom.updateMeetingSetting({
          disableVideoPreview: true,
        });

        console.log(`Joining Zoom meeting ${meetingNumber}...`);
        const result = await zoom.joinMeeting({
          userName,
          meetingNumber,
          password: password || "",
          noAudio: false,
          noVideo: false,
        });

        console.log("Join meeting request dispatch result:", result);
        if (result !== "MobileRTCMeetError_Success" && result !== "MEETING_ERROR_SUCCESS") {
          setErrorMessage(`Failed to dispatch join request: ${result}`);
          setMeetingState("Failed");
        }
      } catch (err: any) {
        console.error("Error executing joinMeeting:", err);
        setErrorMessage(err.message || "An unexpected error occurred while joining.");
        setMeetingState("Failed");
      }
    };

    return () => {
      authSub.remove();
      stateSub.remove();
      errorSub.remove();
    };
  }, [meetingNumber, password, userName]);

  return (
    <View style={styles.contentContainer}>
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Occurred</Text>
          <Text style={styles.errorSubtitle}>{errorMessage}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onLeave}>
            <Text style={styles.closeButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ActivityIndicator size="large" color="#3C61DD" />
          <Text style={styles.stateText}>{meetingState}</Text>
        </>
      )}
    </View>
  );
}

export default function ZoomMeetingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    meetingUrl?: string;
    meetingId?: string;
    meetingPassword?: string;
    therapistName?: string;
    patientName?: string;
    sdkSignature?: string;
  }>();

  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [meetingNumber, setMeetingNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permError, setPermError] = useState<boolean>(false);

  const rawUrl = params.meetingUrl || "";
  const therapistName = params.therapistName || "Therapist";
  const patientName = params.patientName || "Patient";

  useEffect(() => {
    let extractedMeetingId = params.meetingId || "";
    let extractedPassword = params.meetingPassword || "";

    if (!extractedMeetingId && rawUrl) {
      // Parse meeting number (ID) and password
      const joinRegex = /\/j\/([0-9a-zA-Z_-]+)/;
      const match = rawUrl.match(joinRegex);

      if (match) {
        extractedMeetingId = match[1];
      }

      const pwdMatch = rawUrl.match(/[?&]pwd=([^&]+)/);
      if (pwdMatch) {
        extractedPassword = pwdMatch[1];
      }

      // Fallback if URL is just raw meeting ID
      if (!extractedMeetingId && /^\d+$/.test(rawUrl.trim())) {
        extractedMeetingId = rawUrl.trim();
      }
    }

    if (!extractedMeetingId) {
      setIsLoading(false);
      return;
    }

    setMeetingNumber(extractedMeetingId);
    setPassword(extractedPassword);
    setUserName(patientName);

    // Request permissions and retrieve token
    const setup = async () => {
      try {
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) {
          setPermError(true);
          setIsLoading(false);
          return;
        }

        const token = params.sdkSignature || "";
        setJwtToken(token);
      } catch (err) {
        console.error("Setup error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    setup();
  }, [params.meetingId, params.meetingPassword, rawUrl, patientName, params.sdkSignature]);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        return (
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn("Permissions request error:", err);
        return false;
      }
    }
    return true;
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Feather name="arrow-left" size={normalize(24)} color="#11181C" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            Session with {therapistName}
          </Text>
          <Text style={styles.subtitle}>Zoom Meeting SDK</Text>
        </View>
      </View>

      {/* Main Body */}
      <View style={styles.body}>
        {isLoading ? (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color="#3C61DD" />
            <Text style={styles.stateText}>Preparing meeting connection...</Text>
          </View>
        ) : permError ? (
          <View style={styles.errorContainer}>
            <Feather name="video-off" size={normalize(48)} color="#E53935" />
            <Text style={styles.errorTitle}>Permissions Denied</Text>
            <Text style={styles.errorSubtitle}>
              Camera and Microphone permissions are required to join the Zoom meeting.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleBackPress}>
              <Text style={styles.closeButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : !meetingNumber ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={normalize(48)} color="#E53935" />
            <Text style={styles.errorTitle}>Invalid Meeting URL</Text>
            <Text style={styles.errorSubtitle}>
              No valid Zoom meeting URL/ID was provided for this session.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleBackPress}>
              <Text style={styles.closeButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : jwtToken ? (
          <ZoomSDKProvider
            config={{
              jwtToken: jwtToken,
              domain: "zoom.us",
              enableLog: true,
            }}
          >
            <ZoomMeetingInner
              meetingNumber={meetingNumber}
              password={password}
              userName={userName}
              onLeave={handleBackPress}
            />
          </ZoomSDKProvider>
        ) : (
          <View style={styles.errorContainer}>
            <Feather name="alert-triangle" size={normalize(48)} color="#E53935" />
            <Text style={styles.errorTitle}>Authentication Error</Text>
            <Text style={styles.errorSubtitle}>
              Could not authenticate with the Zoom server. Meeting token/signature is missing or
              invalid.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleBackPress}>
              <Text style={styles.closeButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: hp(7),
    paddingHorizontal: wp(4),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: moderateScale(4),
  },
  titleContainer: {
    flex: 1,
    marginLeft: wp(3),
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#0F172A",
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#64748B",
    marginTop: hp(0.1),
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: wp(8),
  },
  stateText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#475569",
    marginTop: hp(2),
    textAlign: "center",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  errorTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#0F172A",
    marginTop: hp(2),
    marginBottom: hp(1),
    textAlign: "center",
  },
  errorSubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#64748B",
    textAlign: "center",
    lineHeight: normalize(20),
    marginBottom: hp(3),
  },
  closeButton: {
    backgroundColor: "#3C61DD",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: normalize(24),
    marginTop: hp(2),
  },
  closeButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
});
