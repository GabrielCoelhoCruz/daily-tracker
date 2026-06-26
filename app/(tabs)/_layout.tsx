import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { TabIcon, TAB_INACTIVE_TINT, tabBarLabelStyle } from "@/components/ui/TabIcon";

export const unstable_settings = {
  initialRouteName: "(hoje)",
};

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="(hoje)"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.DEFAULT,
        tabBarInactiveTintColor: TAB_INACTIVE_TINT,
        tabBarLabelStyle: tabBarLabelStyle,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
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
            <TabIcon name="grid" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(treino)"
        options={{
          title: "Train",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="barbell" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(historico)"
        options={{
          title: "Logs",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="document-text" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(progresso)"
        options={{
          title: "Stats",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="analytics" focused={focused} color={color} />
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
