import { MORE_OPTIONS_ITEMS } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { navigation } = props;
  const router = useRouter();

  return (
    <View style={[styles.drawerContainer, { paddingTop: insets.top }]}>
      {/* Drawer Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.closeDrawer()}>
          <Feather name="menu" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>More Options</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.closeDrawer();
            router.push("/profile");
          }}
        >
          <View style={styles.avatarContainer}>
            <Image source={require("@/assets/images/avatar.png")} style={styles.avatar} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.itemsCard}>
          {MORE_OPTIONS_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemRow, index === MORE_OPTIONS_ITEMS.length - 1 && styles.noBorder]}
              activeOpacity={0.7}
              onPress={() => {
                const route = item.route.replace("/", "");
                // If the route is global (privacy/terms), use router.push, else navigate in drawer
                if (route === "privacy-policy" || route === "terms") {
                  navigation.closeDrawer();
                  navigation.navigate(route as any);
                } else {
                  navigation.navigate(route as any);
                }
              }}
            >
              <View style={styles.itemLeft}>
                <Feather name={item.icon as any} size={22} color={item.color} />
                <Text style={[styles.itemText, item.id === "sos" && styles.sosText]}>
                  {item.label}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color={item.id === "sos" ? "#FFC1C1" : "#D1D1D1"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* New Chat Button at Bottom */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            navigation.navigate("chatstarter");
            navigation.closeDrawer();
          }}
        >
          <Feather name="plus" size={24} color="#FFF" />
          <Text style={styles.fabText}>New chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          width: "100%",
          backgroundColor: "#F2F9FF",
        },
      }}
    >
      <Drawer.Screen name="chatstarter" options={{ title: "Home" }} />
      <Drawer.Screen name="conversations" options={{ title: "Conversations" }} />
      <Drawer.Screen name="chat" options={{ title: "Chat" }} />
      <Drawer.Screen name="faq" options={{ title: "FAQ" }} />
      <Drawer.Screen name="coming-soon" options={{ title: "Coming Soon" }} />
      <Drawer.Screen name="sos" options={{ title: "SOS" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#F2F9FF",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(20),
    color: "#000",
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    backgroundColor: "#D1E5FF",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemsCard: {
    backgroundColor: "transparent",
    marginTop: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  itemText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#333",
  },
  sosText: {
    color: "#FF3B30",
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: "flex-end",
  },
  fab: {
    backgroundColor: "#3C61DD",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#3C61DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(16),
    color: "#FFF",
    marginLeft: 8,
  },
});
