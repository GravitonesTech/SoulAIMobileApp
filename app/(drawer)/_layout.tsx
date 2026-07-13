import { AppHeader } from "@/components/ui/AppHeader";
import { MORE_OPTIONS_ITEMS } from "@/constants/StaticData";
import { Typography } from "@/constants/Typography";
import { normalize } from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const router = useRouter();

  return (
    <SafeAreaView style={styles.drawerContainer} edges={["top", "bottom"]}>
      {/* Drawer Header */}
      <AppHeader
        title="More Options"
        onLeftPress={() => navigation.closeDrawer()}
        onAvatarPress={() => {
          navigation.closeDrawer();
          router.push("/profile");
        }}
      />

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
                if (route === "privacy-policy" || route === "terms" || route === "profile") {
                  navigation.closeDrawer();
                  router.push(`/${route}` as any);
                } else if (route === "sound-healing-flow") {
                  navigation.closeDrawer();
                  navigation.navigate("sound-healing-flow", {
                    screen: "index",
                    params: {
                      from: undefined,
                      sessionId: undefined,
                      therapy: undefined,
                      selected_therapy: undefined,
                      showNewChatButton: undefined,
                    },
                  } as any);
                } else {
                  navigation.navigate(route as any);
                }
              }}
            >
              <View style={styles.itemLeft}>
                <Feather name={item.icon as any} size={normalize(22)} color={item.color} />
                <Text style={[styles.itemText, item.id === "sos" && styles.sosText]}>
                  {item.label}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={normalize(18)}
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
          <Feather name="plus" size={normalize(24)} color="#FFF" />
          <Text style={styles.fabText}>New chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
      <Drawer.Screen name="group-chat" options={{ title: "Group Chat" }} />
      <Drawer.Screen name="sos" options={{ title: "SOS" }} />
      <Drawer.Screen name="human-therapists" options={{ title: "Human Therapists" }} />
      <Drawer.Screen name="breathing" options={{ title: "Breathing Exercise" }} />
      {/* <Drawer.Screen name="demo" options={{ title: "Interactive Demo" }} /> */}
      <Drawer.Screen name="sound-healing-flow" options={{ title: "Sound Healing" }} />
      {/* <Drawer.Screen name="downloads" options={{ title: "Downloads" }} /> */}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#F2F9FF",
  },
  scrollContent: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(20),
  },
  itemsCard: {
    backgroundColor: "transparent",
    marginTop: normalize(10),
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: normalize(18),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(15),
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
    padding: normalize(20),
    paddingBottom: normalize(40),
    alignItems: "flex-end",
  },
  fab: {
    backgroundColor: "#3C61DD",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(12),
    borderRadius: normalize(30),
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
    marginLeft: normalize(8),
  },
});
