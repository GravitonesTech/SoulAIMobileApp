import { Typography } from "@/constants/Typography";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ComingSoonScreen() {
  const navigation = useNavigation<any>();

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
            <Feather name="menu" size={26} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Feather name="clock" size={48} color="#3C61DD" />
          </View>
          <Text style={styles.title}>Coming Soon</Text>
          <Text style={styles.description}>
            We're working hard to bring this feature to you. Stay tuned for updates!
          </Text>
        </View>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    marginTop: -50, // Offset for header
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(60, 97, 221, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: Typography.fonts.medium,
    fontSize: 28,
    color: "#111111",
    marginBottom: 12,
  },
  description: {
    fontFamily: Typography.fonts.regular,
    fontSize: 16,
    color: "#8A8A8E",
    textAlign: "center",
    lineHeight: 24,
  },
});
