import { AppHeader } from "@/components/ui/AppHeader";
import { SOUND_HEALING_CATEGORIES } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function SoundHealingScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E2F4FF"]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.flex1}>
          <AppHeader title="Sound Healing" leftIcon="arrow-left" />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {SOUND_HEALING_CATEGORIES.map((category, index) => (
              <View key={index} style={styles.sectionContainer}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/sound-healing-flow/sound-category",
                      params: { title: category.title },
                    })
                  }
                >
                  <Text style={styles.sectionTitle}>{category.title}</Text>
                  <Feather name="arrow-right" size={normalize(18)} color="#A0A0A0" />
                </TouchableOpacity>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {category.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.card}
                      activeOpacity={0.9}
                      onPress={() => router.push("/sound-healing-flow/now-playing")}
                    >
                      <Image source={{ uri: item.image }} style={styles.cardImage} />
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
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
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: moderateScale(40),
  },
  sectionContainer: {
    marginTop: moderateScale(24),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(16),
  },
  sectionTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#4A4A4A",
    letterSpacing: 0.5,
  },
  horizontalScrollContent: {
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(16),
  },
  card: {
    width: wp(40),
  },
  cardImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: normalize(12),
    marginBottom: moderateScale(10),
  },
  cardTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(15),
    color: "#2C2C2C",
    marginBottom: moderateScale(4),
  },
  cardSubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(12),
    color: "#8E8E8E",
  },
});
