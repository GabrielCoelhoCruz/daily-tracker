import { Stack } from "expo-router";
import {
  detailStackScreenOptions,
  glassSheetScreenOptions,
  tabStackScreenOptions,
} from "@/constants/stackScreenOptions";
import { SettingsHeaderButton } from "@/components/ui/SettingsHeaderButton";

export default function HistoricoLayout() {
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
          title: "Revisão do prep",
        }}
      />
      <Stack.Screen
        name="dia-detalhe"
        options={{
          ...glassSheetScreenOptions,
          ...detailStackScreenOptions,
          sheetAllowedDetents: [0.5, 1.0],
          title: "Detalhes do Dia",
        }}
      />
    </Stack>
  );
}
