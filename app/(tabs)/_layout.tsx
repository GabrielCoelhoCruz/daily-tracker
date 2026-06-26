import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { theme } from "@/constants/theme";

export const unstable_settings = {
  initialRouteName: "(hoje)",
};

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="(hoje)"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.DEFAULT,
        tabBarInactiveTintColor: theme.colors.onSurface.variant + "66",
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: "800",
          letterSpacing: 2,
          textTransform: "uppercase",
        },
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: "rgba(255,255,255,0.05)",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.onSurface.DEFAULT,
      }}
    >
      <Tabs.Screen
        name="(hoje)"
        options={{
          title: "Dash",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -12,
                    width: 40,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: theme.colors.primary.DEFAULT,
                  }}
                />
              )}
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(treino)"
        options={{
          title: "Train",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -12,
                    width: 40,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: theme.colors.primary.DEFAULT,
                  }}
                />
              )}
              <Ionicons
                name={focused ? "barbell" : "barbell-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(historico)"
        options={{
          title: "Logs",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -12,
                    width: 40,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: theme.colors.primary.DEFAULT,
                  }}
                />
              )}
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(progresso)"
        options={{
          title: "Stats",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -12,
                    width: 40,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: theme.colors.primary.DEFAULT,
                  }}
                />
              )}
              <Ionicons
                name={focused ? "analytics" : "analytics-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
