import { Typography } from "@/constants/Typography";
import { useAppConfirmation } from "@/hooks/useAppConfirmation";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// Safe Base64 encoder for React Native environments
const encodeBase64 = (str: string): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  let i = 0;
  const rawStr = unescape(encodeURIComponent(str));
  while (i < rawStr.length) {
    const a = rawStr.charCodeAt(i++) || 0;
    const b = rawStr.charCodeAt(i++) || 0;
    const c = rawStr.charCodeAt(i++) || 0;
    const triple = (a << 16) + (b << 8) + c;
    result +=
      chars[(triple >> 18) & 0x3f] +
      chars[(triple >> 12) & 0x3f] +
      chars[(triple >> 6) & 0x3f] +
      chars[triple & 0x3f];
  }
  const diff = rawStr.length % 3;
  if (diff === 1) {
    return result.slice(0, -2) + "==";
  } else if (diff === 2) {
    return result.slice(0, -1) + "=";
  }
  return result;
};

export default function ZoomMeetingScreen() {
  const router = useRouter();
  const { showConfirmation } = useAppConfirmation();
  const params = useLocalSearchParams<{
    meetingUrl?: string;
    therapistName?: string;
    patientName?: string;
  }>();
  const webViewRef = useRef<WebView>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rawUrl = params.meetingUrl || "";
  const therapistName = params.therapistName || "Therapist";
  const patientName = params.patientName || "";

  // Convert standard Zoom links to Web Client URLs so they run in-app
  const convertToZoomWebClientUrl = (url: string, name?: string): string => {
    if (!url) return "";

    // Match zoom.us/j/MEETING_ID
    const zoomRegex = /^(https?:\/\/[^\/]*zoom\.us)\/j\/([0-9a-zA-Z_-]+)(.*)$/;
    const match = url.match(zoomRegex);

    let resultUrl = url;
    if (match) {
      const meetingId = match[2];
      const rest = match[3]; // Includes parameters like ?pwd=...
      resultUrl = `https://zoom.us/wc/${meetingId}/join${rest}`;
    }

    if (name && resultUrl.includes("/wc/")) {
      try {
        const encodedName = encodeBase64(name);
        const delimiter = resultUrl.includes("?") ? "&" : "?";
        resultUrl = `${resultUrl}${delimiter}prefer=1&un=${encodedName}`;
      } catch (e) {
        console.warn("Failed to encode patient name for Zoom URL:", e);
      }
    }

    return resultUrl;
  };

  const zoomUrl = convertToZoomWebClientUrl(rawUrl, patientName);

  // Request permissions for Android
  const requestAndroidPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        const cameraGranted =
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
        const micGranted =
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED;

        console.log("Android permissions granted status:", { cameraGranted, micGranted });
      } catch (err) {
        console.warn("Failed to request Android permissions:", err);
      }
    }
  };

  useEffect(() => {
    requestAndroidPermissions();
  }, []);

  const handleBackPress = () => {
    showConfirmation(
      "Leave Session?",
      "Are you sure you want to end or leave this video session?",
      () => {
        router.back();
      },
      {
        confirmLabel: "Leave",
        cancelLabel: "Cancel",
      },
    );
  };

  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [showConfirmation]);

  const handleReload = () => {
    setError(null);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  // A desktop user agent makes Zoom load the web client instead of showing the mobile download screen.
  const desktopUserAgent = Platform.select({
    ios: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
    android:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36",
    default:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36",
  });

  const injectViewportAndStyles = `
    (function() {
      // 1. Set Viewport for responsive mobile rendering
      var meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

      // 2. Inject CSS Styles to force full height, hide overflows and scrollbars
      var style = document.createElement('style');
      style.innerHTML = \`
        * {
          max-width: 100vw !important;
          box-sizing: border-box !important;
        }
        html, body {
          width: 100% !important;
          overflow-x: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #root, #zmmtg-root, .meeting-client {
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        /* Enable vertical scroll ONLY on the join/login forms if they exceed height */
        #join-form, .join-flow, .meeting-info-container {
          overflow-y: auto !important;
          max-height: 100% !important;
        }
      \`;
      document.head.appendChild(style);
    })();
    true;
  `;

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
          <Text style={styles.subtitle}>Zoom Secure Video Link</Text>
        </View>
        <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
          <Feather name="refresh-cw" size={normalize(20)} color="#3C61DD" />
        </TouchableOpacity>
      </View>

      {/* WebView or Permissions error */}
      <View style={styles.webviewContainer}>
        {zoomUrl ? (
          <WebView
            ref={webViewRef}
            source={{ uri: zoomUrl }}
            userAgent={desktopUserAgent}
            style={styles.webview}
            originWhitelist={["*"]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            geolocationEnabled={true}
            scalesPageToFit={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            injectedJavaScript={injectViewportAndStyles}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              setError(nativeEvent.description || "Failed to load Zoom room.");
              setIsLoading(false);
            }}
            // Permission request interceptor for modern WebView
            // @ts-ignore
            onPermissionRequest={(request: any) => {
              request.grant();
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Feather name="video-off" size={normalize(48)} color="#E53935" />
            <Text style={styles.errorTitle}>Invalid Meeting URL</Text>
            <Text style={styles.errorSubtitle}>
              No valid Zoom meeting URL was provided for this session.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Text style={styles.closeButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3C61DD" />
            <Text style={styles.loadingText}>Connecting to Zoom Room...</Text>
            <Text style={styles.loadingTip}>
              Please grant microphone and camera access if prompted.
            </Text>
          </View>
        )}

        {/* WebView Load Error Screen */}
        {error && (
          <View style={styles.errorOverlay}>
            <Feather name="wifi-off" size={normalize(48)} color="#E53935" />
            <Text style={styles.errorTitle}>Connection Failed</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer / Tip Bar */}
      <View style={styles.tipBar}>
        <Feather name="info" size={normalize(16)} color="#3C61DD" style={{ marginRight: wp(2) }} />
        <Text style={styles.tipText}>
          If prompted, tap &apos;Join from browser&apos; to start call.
        </Text>
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
    justifyContent: "space-between",
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
  reloadButton: {
    padding: moderateScale(6),
  },
  webviewContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#F8FAFC",
  },
  webview: {
    width: "98%",
    paddingHorizontal: 5,
    alignSelf: "center",
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  loadingText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#0F172A",
    marginTop: hp(2),
    textAlign: "center",
  },
  loadingTip: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#64748B",
    marginTop: hp(1),
    textAlign: "center",
    lineHeight: normalize(18),
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
    backgroundColor: "#F8FAFC",
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
  retryButton: {
    backgroundColor: "#3C61DD",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: normalize(24),
  },
  retryButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
  closeButton: {
    backgroundColor: "#64748B",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: normalize(24),
  },
  closeButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#FFFFFF",
  },
  tipBar: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#DBEAFE",
  },
  tipText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#1E40AF",
    flex: 1,
  },
});
