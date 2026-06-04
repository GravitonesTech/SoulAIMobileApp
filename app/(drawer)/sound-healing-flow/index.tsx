import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { apiClient } from "@/utils/api";
import { moderateScale, normalize, wp } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getSubcategoryName = (
  subcategoryId: number | string | null | undefined,
  subcategories: any[],
) => {
  if (!subcategoryId) return "";
  const sub = subcategories.find((s) => String(s.id) === String(subcategoryId));
  return sub ? (sub.name || "").trim() : "";
};

type Sound = {
  id: number;
  short_name: string;
  description: string;
  image: string;
  sound: string;
  category_id: number;
  artist_name?: string | null;
  subcategory_id?: number | null;
};

type Category = {
  id: number;
  name: string;
  description: string;
  image: string;
  status: boolean;
  sounds?: Sound[];
};

export default function SoundHealingScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setLoading(true);
      const subRes = await apiClient.get(ENDPOINTS.master.soundSubcategories);
      if (subRes.success && subRes.data) {
        setSubcategories(subRes.data);
      }

      const catRes = await apiClient.get(ENDPOINTS.master.soundCategories);
      if (catRes.success && catRes.data) {
        const fetchedCats: Category[] = catRes.data;

        if (fetchedCats.length > 0) {
          const catsWithSounds = await Promise.all(
            fetchedCats.map(async (cat) => {
              const soundRes = await apiClient.get(ENDPOINTS.master.categorySounds(cat.id));
              let sounds: Sound[] = [];
              if (soundRes.success && soundRes.data) {
                sounds = soundRes.data;
              }
              return { ...cat, sounds };
            }),
          );

          // Filter out categories that have no sounds
          const categoriesWithMusic = catsWithSounds.filter(
            (cat) => cat.sounds && cat.sounds.length > 0,
          );
          setCategories(categoriesWithMusic);
        } else {
          setCategories([]);
        }
      }
    } catch (error) {
      console.error("Error fetching sound categories:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

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
            contentContainerStyle={[
              styles.scrollContent,
              (loading || categories.length === 0) && { flexGrow: 1, justifyContent: "center" },
            ]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : categories.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.nothingFoundText}>Nothing found</Text>
              </View>
            ) : (
              categories.map((category) => (
                <View key={category.id} style={styles.sectionContainer}>
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: "/sound-healing-flow/sound-category",
                        params: { title: category.name, id: category.id },
                      })
                    }
                  >
                    <Text style={styles.sectionTitle}>{(category.name || "").toUpperCase()}</Text>
                    <Feather name="arrow-right" size={normalize(18)} color="#A0A0A0" />
                  </TouchableOpacity>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                  >
                    {category.sounds && category.sounds.length > 0 ? (
                      category.sounds.map((sound) => (
                        <TouchableOpacity
                          key={sound.id}
                          style={styles.card}
                          activeOpacity={0.9}
                          onPress={() =>
                            router.push({
                              pathname: "/sound-healing-flow/now-playing",
                              params: {
                                id: sound.id,
                                url: sound.sound,
                                title: sound.short_name,
                                artist: sound.artist_name || category.name,
                                image: sound.image || category.image,
                                categoryId: category.id,
                                artist_name: sound.artist_name || "",
                                subcategory_id: sound.subcategory_id
                                  ? String(sound.subcategory_id)
                                  : "",
                              },
                            })
                          }
                        >
                          <Image
                            source={{ uri: sound.image || category.image }}
                            style={styles.cardImage}
                          />
                          <Text style={styles.cardTitle} numberOfLines={1}>
                            {sound.short_name}
                          </Text>
                          <Text style={styles.cardSubtitle} numberOfLines={1}>
                            {(() => {
                              const sub = getSubcategoryName(sound.subcategory_id, subcategories);
                              const artist = sound.artist_name;
                              return sub && artist ? `${sub} • ${artist}` : sub || artist || "";
                            })()}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noSoundsText}>No sounds available</Text>
                    )}
                  </ScrollView>
                </View>
              ))
            )}
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  nothingFoundText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#8E8E8E",
  },
  noSoundsText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#8E8E8E",
    fontStyle: "italic",
    paddingVertical: moderateScale(20),
  },
});
