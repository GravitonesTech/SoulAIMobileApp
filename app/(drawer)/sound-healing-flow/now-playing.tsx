import { AppHeader } from "@/components/ui/AppHeader";
import { Typography } from "@/constants/Typography";
import { moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NowPlayingScreen() {
  const navigation = useNavigation();
  const { title, artist, image, url } = useLocalSearchParams();

  const displayTitle = title ? String(title) : "Unknown Title";
  const displayArtist = artist ? `by ${String(artist)}` : "Unknown Artist";
  const displayImage = image
    ? String(image)
    : "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=800&q=80";

  const player = useAudioPlayer(url ? String(url) : null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (player && url) {
      player.play();
    }
  }, [player, url]);

  const handlePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
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
          <AppHeader title="Now Playing" leftIcon="arrow-left" titleColor="#FFF" iconColor="#FFF" />

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
              <Text style={styles.subtitle}>{displayArtist}</Text>
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
                <Feather name="shuffle" size={normalize(20)} color="#E0E0E0" />
              </TouchableOpacity>
              <TouchableOpacity>
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
              <TouchableOpacity>
                <Feather name="skip-forward" size={normalize(28)} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Feather name="download" size={normalize(20)} color="#E0E0E0" />
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
