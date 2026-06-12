import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { apiClient } from "@/utils/api";
import { moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useIsFocused } from "@react-navigation/native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const getSubcategoryName = (
  subcategoryId: number | string | null | undefined,
  subcategories: any[],
) => {
  if (!subcategoryId) return "";
  const sub = subcategories.find((s) => String(s.id) === String(subcategoryId));
  return sub ? (sub.name || "").trim() : "";
};

export default function NowPlayingScreen() {
  const router = useRouter();
  const {
    title,
    artist,
    image,
    url,
    id,
    categoryId,
    artist_name,
    subcategory_id,
    startTime,
    from,
  } = useLocalSearchParams();

  const [sounds, setSounds] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubcategoriesAndSounds = async () => {
      try {
        const subRes = await apiClient.get(ENDPOINTS.master.soundSubcategories);
        if (subRes.success && subRes.data) {
          setSubcategories(subRes.data);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }

      if (!categoryId) return;
      try {
        const res = await apiClient.get(ENDPOINTS.master.categorySounds(Number(categoryId)));
        if (res.success && res.data) {
          setSounds(res.data);
        }
      } catch (error) {
        console.error("Error fetching category sounds:", error);
      }
    };
    fetchSubcategoriesAndSounds();
  }, [categoryId]);

  const handleNext = () => {
    if (!sounds.length) return;
    const currentIndex = sounds.findIndex((s) => String(s.id) === String(id));
    if (currentIndex !== -1 && currentIndex < sounds.length - 1) {
      const nextTrack = sounds[currentIndex + 1];
      router.setParams({
        id: String(nextTrack.id),
        url: nextTrack.sound,
        title: nextTrack.short_name,
        image: nextTrack.image,
        artist: nextTrack.artist_name || artist,
        artist_name: nextTrack.artist_name || "",
        subcategory_id: nextTrack.subcategory_id ? String(nextTrack.subcategory_id) : "",
      });
    }
  };

  const handlePrev = () => {
    if (!sounds.length) return;
    const currentIndex = sounds.findIndex((s) => String(s.id) === String(id));
    if (currentIndex > 0) {
      const prevTrack = sounds[currentIndex - 1];
      router.setParams({
        id: String(prevTrack.id),
        url: prevTrack.sound,
        title: prevTrack.short_name,
        image: prevTrack.image,
        artist: prevTrack.artist_name || artist,
        artist_name: prevTrack.artist_name || "",
        subcategory_id: prevTrack.subcategory_id ? String(prevTrack.subcategory_id) : "",
      });
    }
  };

  const currentTrack = sounds.find((s) => String(s.id) === String(id));
  const displayTitle = title ? String(title) : currentTrack?.short_name || "Unknown Title";
  const displayArtistName = currentTrack?.artist_name || (artist_name ? String(artist_name) : "");
  const subId = currentTrack?.subcategory_id || (subcategory_id ? Number(subcategory_id) : null);
  const subName = getSubcategoryName(subId, subcategories);
  const displaySubtitle =
    subName && displayArtistName
      ? `${subName} by ${displayArtistName}`
      : subName || (displayArtistName ? `by ${displayArtistName}` : "Soul AI");
  const displayImage = image
    ? String(image)
    : currentTrack?.image ||
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=800&q=80";

  const player = useAudioPlayer(url ? String(url) : null);
  const status = useAudioPlayerStatus(player);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused && player) {
      try {
        player.pause();
      } catch (e) {
        console.warn("Failed to pause player on blur:", e);
      }
    }
  }, [isFocused, player]);

  const hasSoughtRef = useRef(false);

  useEffect(() => {
    if (player && url) {
      if (startTime && !hasSoughtRef.current) {
        hasSoughtRef.current = true;
        console.log("[NowPlaying] Received startTime parameter:", startTime);
        try {
          player.seekTo(Number(startTime));
        } catch (e) {
          console.warn("Failed to seek to startTime:", e);
        }
      }
      player.play();
    }
  }, [player, url, startTime]);

  const handlePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!url) {
      Toast.show({ type: "error", text1: "Error", text2: "No audio URL available." });
      return;
    }
    try {
      setIsDownloading(true);
      const safeTitle = displayTitle.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${safeTitle}.mp3`;

      const localUri = FileSystem.cacheDirectory + fileName;
      const downloadRes = await FileSystem.downloadAsync(String(url), localUri);

      if (downloadRes.status !== 200) {
        throw new Error("Download failed");
      }

      const soulAiDir = FileSystem.documentDirectory + "SoulAI/";
      const dirInfo = await FileSystem.getInfoAsync(soulAiDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(soulAiDir, { intermediates: true });
      }

      const destUri = soulAiDir + fileName;
      await FileSystem.moveAsync({ from: localUri, to: destUri });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Audio saved to internal storage!",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong while downloading.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds || 0);
    const minutes = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${minutes}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [sliderValueProp, setSliderValueProp] = useState(0);

  useEffect(() => {
    if (!isSeeking) {
      setSliderValueProp(status.currentTime);
    }
  }, [status.currentTime, isSeeking]);

  const currentDisplayValue = isSeeking ? seekValue : status.currentTime;
  const progressPercent = status.duration > 0 ? (currentDisplayValue / status.duration) * 100 : 0;

  const currentIndex = sounds.findIndex((s) => String(s.id) === String(id));
  const hasPrev = sounds.length > 0 && currentIndex > 0;
  const hasNext = sounds.length > 0 && currentIndex !== -1 && currentIndex < sounds.length - 1;

  return (
    <LinearGradient
      colors={["#3BC0EB", "#5858E8"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.flex1}>
          {/* Header */}
          <AppHeader
            title="Now Playing"
            leftIcon="arrow-left"
            titleColor="#FFF"
            iconColor="#FFF"
            onLeftPress={() => {
              if (from === "chat") {
                router.push("/sound-healing-flow");
              } else {
                router.back();
              }
            }}
          />

          <View style={styles.contentContainer}>
            {/* Artwork */}
            <View style={styles.artworkContainer}>
              <Image
                source={{
                  uri: displayImage,
                }}
                style={styles.artwork}
              />
            </View>

            {/* Title and Subtitle */}
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{displayTitle}</Text>
              <Text style={styles.subtitle}>{displaySubtitle}</Text>
            </View>

            {/* Slider */}
            <View style={styles.sliderContainer}>
              <View style={{ justifyContent: "center", height: 40 }}>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${progressPercent}%` }]} />
                  <View style={styles.sliderThumb} />
                </View>
                <Slider
                  style={{ position: "absolute", width: "100%", height: 40 }}
                  minimumValue={0}
                  maximumValue={status.duration > 0 ? status.duration : 1}
                  value={sliderValueProp}
                  minimumTrackTintColor="transparent"
                  maximumTrackTintColor="transparent"
                  thumbTintColor="transparent"
                  onSlidingStart={() => {
                    setIsSeeking(true);
                    setSeekValue(sliderValueProp);
                  }}
                  onValueChange={(value) => {
                    setSeekValue(value);
                  }}
                  onSlidingComplete={(value) => {
                    player.seekTo(value);
                    setTimeout(() => {
                      setIsSeeking(false);
                    }, 200);
                  }}
                />
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(currentDisplayValue)}</Text>
                <Text style={styles.timeText}>{formatTime(status.duration)}</Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity>
                <MaterialCommunityIcons name="dolby" size={normalize(24)} color="#E0E0E0" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePrev}
                disabled={!hasPrev}
                style={{ opacity: hasPrev ? 1 : 0.4 }}
              >
                <Feather name="skip-back" size={normalize(28)} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playButton}
                activeOpacity={0.8}
                onPress={handlePlayPause}
              >
                <Feather
                  name={player.playing ? "pause" : "play"}
                  size={normalize(32)}
                  color="#5C6BC0"
                  style={!player.playing ? { marginLeft: normalize(4) } : {}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNext}
                disabled={!hasNext}
                style={{ opacity: hasNext ? 1 : 0.4 }}
              >
                <Feather name="skip-forward" size={normalize(28)} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#E0E0E0" />
                ) : (
                  <Feather name="download" size={normalize(20)} color="#E0E0E0" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: moderateScale(10),
  },
  iconButton: {
    padding: moderateScale(5),
  },
  headerTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(18),
    color: "#FFF",
  },
  avatarPlaceholder: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: normalize(18),
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  artworkContainer: {
    alignItems: "center",
    marginTop: moderateScale(50),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  artwork: {
    width: wp(75),
    height: wp(75),
    borderRadius: normalize(12),
  },
  infoContainer: {
    alignItems: "center",
    marginTop: moderateScale(40),
  },
  title: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(24),
    color: "#FFF",
    marginBottom: moderateScale(8),
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "rgba(255, 255, 255, 0.7)",
  },
  sliderContainer: {
    marginTop: moderateScale(40),
  },
  sliderTrack: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  sliderFill: {
    width: "15%",
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 2,
  },
  sliderThumb: {
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(6),
    backgroundColor: "#FFF",
    marginLeft: -normalize(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: moderateScale(10),
  },
  timeText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "rgba(255, 255, 255, 0.6)",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: moderateScale(40),
    paddingHorizontal: moderateScale(10),
  },
  playButton: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
