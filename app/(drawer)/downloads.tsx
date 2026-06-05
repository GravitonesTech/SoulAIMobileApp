import { AppHeader } from "@/components/ui/AppHeader";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type DownloadedTrack = {
  name: string;
  title: string;
  uri: string;
  size: number;
};

export default function DownloadsScreen() {
  const router = useRouter();
  const [tracks, setTracks] = useState<DownloadedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingUri, setPlayingUri] = useState<string | null>(null);

  // Audio Player setup
  const player = useAudioPlayer(playingUri);
  const status = useAudioPlayerStatus(player);

  useFocusEffect(
    useCallback(() => {
      loadDownloadedTracks();
    }, []),
  );

  useEffect(() => {
    if (player && playingUri) {
      player.play();
    }
  }, [player, playingUri]);

  const loadDownloadedTracks = async () => {
    try {
      setIsLoading(true);
      const soulAiDir = FileSystem.documentDirectory + "SoulAI/";
      const dirInfo = await FileSystem.getInfoAsync(soulAiDir);

      if (!dirInfo.exists) {
        setTracks([]);
        return;
      }

      const fileNames = await FileSystem.readDirectoryAsync(soulAiDir);
      const tempTracks: DownloadedTrack[] = [];

      for (const name of fileNames) {
        if (name.toLowerCase().endsWith(".mp3")) {
          const fileUri = soulAiDir + name;
          const info = await FileSystem.getInfoAsync(fileUri);
          if (info.exists) {
            tempTracks.push({
              name,
              title: name.replace(/\.mp3$/i, "").replace(/_/g, " "),
              uri: fileUri,
              size: info.size || 0,
            });
          }
        }
      }

      setTracks(tempTracks);
    } catch (error) {
      console.error("[Downloads] Error loading downloaded tracks:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load downloaded tracks.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = (track: DownloadedTrack) => {
    if (playingUri === track.uri) {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    } else {
      setPlayingUri(track.uri);
    }
  };

  const handleDelete = async (track: DownloadedTrack) => {
    try {
      if (playingUri === track.uri) {
        player.pause();
        setPlayingUri(null);
      }

      await FileSystem.deleteAsync(track.uri);

      Toast.show({
        type: "success",
        text1: "Deleted",
        text2: `"${track.title}" has been deleted.`,
      });

      // Reload tracks list
      loadDownloadedTracks();
    } catch (error) {
      console.error("[Downloads] Error deleting file:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete file.",
      });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0.0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds || 0);
    const minutes = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${minutes}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const totalSize = tracks.reduce((acc, curr) => acc + curr.size, 0);
  const currentPlayingTrack = tracks.find((t) => t.uri === playingUri);

  const progressPercent = status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <AppHeader title="Downloads" />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3C61DD" />
          </View>
        ) : tracks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="download-cloud" size={normalize(52)} color="#3C61DD" />
            </View>
            <Text style={styles.emptyTitle}>No downloads yet</Text>
            <Text style={styles.emptySubtitle}>
              Audio files you download from the Sound Healing section will appear here for offline
              playback.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/sound-healing-flow")}
            >
              <Text style={styles.exploreButtonText}>Explore Sound Healing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Storage Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryTitle}>Storage Used</Text>
                <Text style={styles.summarySize}>{formatSize(totalSize)}</Text>
              </View>
              <Text style={styles.summaryCount}>
                {tracks.length} {tracks.length === 1 ? "track" : "tracks"} downloaded
              </Text>
            </View>

            {/* Tracks List */}
            <FlatList
              data={tracks}
              keyExtractor={(item) => item.uri}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isCurrent = playingUri === item.uri;
                const isPlaying = isCurrent && player.playing;
                return (
                  <View style={[styles.trackCard, isCurrent && styles.activeTrackCard]}>
                    <TouchableOpacity
                      style={styles.trackPressable}
                      activeOpacity={0.7}
                      onPress={() => handlePlayPause(item)}
                    >
                      <View
                        style={[
                          styles.audioIconContainer,
                          isCurrent && styles.activeAudioIconContainer,
                        ]}
                      >
                        <Feather
                          name={isPlaying ? "pause" : "play"}
                          size={normalize(18)}
                          color={isCurrent ? "#FFF" : "#3C61DD"}
                        />
                      </View>
                      <View style={styles.trackDetails}>
                        <Text
                          style={[styles.trackTitle, isCurrent && styles.activeTrackTitle]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.trackSize}>{formatSize(item.size)}</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Delete button */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                      onPress={() => handleDelete(item)}
                    >
                      <Feather name="trash-2" size={normalize(18)} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        )}
      </SafeAreaView>

      {/* Floating Bottom Player Controls */}
      {playingUri && currentPlayingTrack && (
        <SafeAreaView edges={["bottom"]} style={styles.playerBar}>
          {/* Mini progress bar */}
          <View style={styles.miniProgressTrack}>
            <View style={[styles.miniProgressFill, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.playerBarContent}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerTitle} numberOfLines={1}>
                {currentPlayingTrack.title}
              </Text>
              <Text style={styles.playerTime}>
                {formatTime(status.currentTime)} / {formatTime(status.duration)}
              </Text>
            </View>

            <View style={styles.playerControls}>
              <TouchableOpacity
                style={styles.miniPlayButton}
                onPress={() => {
                  if (player.playing) {
                    player.pause();
                  } else {
                    player.play();
                  }
                }}
              >
                <Feather
                  name={player.playing ? "pause" : "play"}
                  size={normalize(20)}
                  color="#FFF"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closePlayerButton}
                onPress={() => {
                  player.pause();
                  setPlayingUri(null);
                }}
              >
                <Feather name="x" size={normalize(20)} color="#8A8A8E" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF7FF",
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    marginTop: hp(2),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: hp(0.5),
  },
  summaryTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#8A8A8E",
  },
  summarySize: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(22),
    color: "#3C61DD",
  },
  summaryCount: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#464646",
  },
  listContent: {
    paddingBottom: moderateScale(100),
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: normalize(12),
    marginBottom: hp(1.5),
    padding: moderateScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  activeTrackCard: {
    borderColor: "rgba(60, 97, 221, 0.3)",
    borderWidth: 1,
  },
  trackPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  audioIconContainer: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: normalize(19),
    backgroundColor: "#E2F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3.5),
  },
  activeAudioIconContainer: {
    backgroundColor: "#3C61DD",
  },
  trackDetails: {
    flex: 1,
    paddingRight: wp(2),
  },
  trackTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#1C1C1E",
    marginBottom: hp(0.2),
  },
  activeTrackTitle: {
    color: "#3C61DD",
  },
  trackSize: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#8A8A8E",
  },
  deleteButton: {
    padding: moderateScale(8),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  emptyIconContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: normalize(50),
    backgroundColor: "#E2F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(3),
  },
  emptyTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(18),
    color: "#1C1C1E",
    marginBottom: hp(1),
  },
  emptySubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#8A8A8E",
    textAlign: "center",
    lineHeight: normalize(20),
    marginBottom: hp(4),
  },
  exploreButton: {
    backgroundColor: "#3C61DD",
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(12),
    borderRadius: normalize(25),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreButtonText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#FFF",
  },
  playerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  miniProgressTrack: {
    height: 3,
    backgroundColor: "#E0E0E0",
    width: "100%",
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: "#3C61DD",
  },
  playerBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(12),
  },
  playerInfo: {
    flex: 1,
    paddingRight: wp(4),
  },
  playerTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#1C1C1E",
    marginBottom: hp(0.2),
  },
  playerTime: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#8A8A8E",
  },
  playerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  miniPlayButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: normalize(18),
    backgroundColor: "#3C61DD",
    justifyContent: "center",
    alignItems: "center",
  },
  closePlayerButton: {
    padding: moderateScale(4),
  },
});
