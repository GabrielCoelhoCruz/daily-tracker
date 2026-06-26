import { Stack } from "expo-router";
import { tabStackScreenOptions } from "@/constants/stackScreenOptions";
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
          title: "Today",
        }}
      />
    </Stack>
  );
}
