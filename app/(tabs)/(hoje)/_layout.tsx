import { Stack } from "expo-router";
import {
  detailStackScreenOptions,
  tabStackScreenOptions,
} from "@/constants/stackScreenOptions";
import { SettingsHeaderButton } from "@/components/ui/SettingsHeaderButton";

export default function HojeLayout() {
  return (
    <Stack
      screenOptions={{
        ...tabStackScreenOptions,
        headerRight: () => <SettingsHeaderButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Hoje",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="protocol"
        options={{
          ...detailStackScreenOptions,
          headerLargeTitle: false,
          title: "Protocolo do Dia",
        }}
      />
    </Stack>
  );
}
