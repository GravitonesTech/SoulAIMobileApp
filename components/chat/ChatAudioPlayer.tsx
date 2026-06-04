import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type RecommendedSound = {
  id: number;
  sound: string;
  short_name: string;
  description: string;
  image: string;
};

interface ChatAudioPlayerProps {
  sound: RecommendedSound;
}

let activePlayer: any = null;

export const ChatAudioPlayer = ({ sound }: ChatAudioPlayerProps) => {
  const player = useAudioPlayer(sound.sound);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (player && sound.sound) {
      player.play();
    }
  }, [player, sound.sound]);

  useEffect(() => {
    // When this player starts playing, pause any other active player
    if (status.playing) {
      if (activePlayer && activePlayer !== player) {
        try {
          activePlayer.pause();
        } catch (e) {
          console.warn("[ChatAudioPlayer] Failed to pause previous player:", e);
        }
      }
      activePlayer = player;
    }
  }, [status.playing, player]);

  useEffect(() => {
    // Cleanup on unmount: pause player and clear activePlayer reference if it is this player
    return () => {
      if (player) {
        player.pause();
      }
      if (activePlayer === player) {
        activePlayer = null;
      }
    };
  }, [player]);

  useEffect(() => {
    // If playback finishes, reset position to start so it can be replayed
    if (!status.playing && status.duration > 0 && status.currentTime >= status.duration - 0.5) {
      player.seekTo(0);
    }
  }, [status.playing, status.currentTime, status.duration, player]);

  const handlePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      // Safeguard: seek to 0 if near the end of track
      if (status.duration > 0 && status.currentTime >= status.duration - 0.5) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const progressPercent = status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Listen to</Text>
          <Text style={styles.title} numberOfLines={1}>
            {(sound.short_name || "").trim()}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {(sound.description || "").trim()}
          </Text>
        </View>
        <Image source={{ uri: sound.image }} style={styles.artwork} />
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} activeOpacity={0.8}>
          <Feather name={status.playing ? "pause" : "play"} size={normalize(26)} color="#3C61DD" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar Track */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(14),
    borderWidth: 1.5,
    borderColor: "#D2E0FC", // Soft light blue border to match the design mock
    alignSelf: "flex-start",
    width: normalize(260), // Shorter width for a more compact, pixel-perfect design
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: normalize(10),
    overflow: "hidden", // Ensures progress bar respects the rounded corners
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingTop: normalize(14),
    paddingBottom: normalize(10), // Reduced bottom padding to align with progress bar
  },
  textContainer: {
    flex: 1,
    paddingRight: normalize(8),
  },
  label: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#4F4F4F",
    marginBottom: normalize(2),
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(15),
    color: "#000000",
    marginBottom: normalize(2),
  },
  description: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(11),
    color: "#7A8B9E",
  },
  artwork: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(8),
    marginRight: normalize(16),
  },
  playButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: normalize(4),
    paddingRight: normalize(8),
  },
  progressContainer: {
    height: normalize(5),
    backgroundColor: "#E2F4FF", // A very soft light blue track
    width: "100%",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3C61DD", // Vibrant brand blue progress indicator
  },
});
