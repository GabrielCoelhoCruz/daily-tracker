import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#78716c",
        tabBarStyle: {
          backgroundColor: "#0c0a09",
          borderTopColor: "#292524",
        },
        headerStyle: {
          backgroundColor: "#0c0a09",
        },
        headerTintColor: "#fafaf9",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hoje",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="check-square-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="treino"
        options={{
          title: "Treino",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="heartbeat" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
