import { AppHeader } from "@/components/ui/AppHeader";
import { ENDPOINTS } from "@/constants/endpoints";
import { Typography } from "@/constants/Typography";
import { apiClient } from "@/utils/api";
import { moderateScale, normalize } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function SoundCategoryScreen() {
  const { title, id } = useLocalSearchParams();
  const router = useRouter();
  const categoryTitle = title || "FOCUS & FLOW";
  const categoryId = id ? Number(id) : null;

  const [sounds, setSounds] = useState<Sound[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSounds = useCallback(
    async (showLoadingIndicator = true) => {
      if (!categoryId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      try {
        if (showLoadingIndicator) setLoading(true);
        const subRes = await apiClient.get(ENDPOINTS.master.soundSubcategories);
        if (subRes.success && subRes.data) {
          setSubcategories(subRes.data);
        }

        const res = await apiClient.get(ENDPOINTS.master.categorySounds(categoryId));
        if (res.success && res.data) {
          setSounds(res.data);
        } else {
          setSounds([]);
        }
      } catch (error) {
        console.error("Error fetching category sounds:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [categoryId],
  );

  useEffect(() => {
    fetchSounds(true);
  }, [fetchSounds]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSounds(false);
  }, [fetchSounds]);

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
              (loading || sounds.length === 0) && { flexGrow: 1 },
            ]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{String(categoryTitle).toUpperCase()}</Text>
            </View>

            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : sounds.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.nothingFoundText}>No sounds available</Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {sounds.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push({
                        pathname: "/sound-healing-flow/now-playing",
                        params: {
                          id: item.id,
                          url: item.sound,
                          title: item.short_name,
                          artist: item.artist_name || categoryTitle,
                          image: item.image,
                          categoryId: categoryId,
                          artist_name: item.artist_name || "",
                          subcategory_id: item.subcategory_id ? String(item.subcategory_id) : "",
                        },
                      })
                    }
                  >
                    <Image source={{ uri: item.image }} style={styles.cardImage} />
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.short_name}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {(() => {
                        const sub = getSubcategoryName(item.subcategory_id, subcategories);
                        const artist = item.artist_name;
                        return sub && artist ? `${sub} • ${artist}` : sub || artist || "";
                      })()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  sectionHeader: {
    paddingHorizontal: moderateScale(20),
    marginTop: moderateScale(24),
    marginBottom: moderateScale(20),
  },
  sectionTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(14),
    color: "#4A4A4A",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
  },
  card: {
    width: "47%",
    marginBottom: moderateScale(20),
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
    marginTop: moderateScale(40),
  },
  nothingFoundText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#8E8E8E",
  },
});
