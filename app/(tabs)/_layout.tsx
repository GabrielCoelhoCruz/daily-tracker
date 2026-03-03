import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";

export const unstable_settings = {
  initialRouteName: "(hoje)",
};

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="(hoje)"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent.DEFAULT,
        tabBarInactiveTintColor: "#a8a29e",
        tabBarStyle: {
          backgroundColor: theme.colors.bg.primary,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.bg.primary,
        },
        headerTintColor: "#fafaf9",
      }}
    >
      <Tabs.Screen
        name="(hoje)"
        options={{
          title: "Hoje",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(treino)"
        options={{
          title: "Treino",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(historico)"
        options={{
          title: "Histórico",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(progresso)"
        options={{
          title: "Progresso",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
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
