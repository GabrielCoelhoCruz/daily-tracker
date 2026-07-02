import { Stack } from "expo-router";
import {
  detailStackScreenOptions,
  glassSheetScreenOptions,
  tabStackScreenOptions,
} from "@/constants/stackScreenOptions";
import { SettingsHeaderButton } from "@/components/ui/SettingsHeaderButton";

export default function ProgressoLayout() {
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
          title: "Evidências",
        }}
      />
      <Stack.Screen
        name="new-checkin"
        options={{
          ...glassSheetScreenOptions,
          sheetAllowedDetents: [0.75, 1.0],
          title: "Novo Check-in",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          ...glassSheetScreenOptions,
          sheetAllowedDetents: [0.75, 1.0],
          title: "Perfil",
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          ...glassSheetScreenOptions,
          sheetAllowedDetents: [0.75, 1.0],
          title: "Categorias",
        }}
      />
      <Stack.Screen
        name="photo-guide"
        options={{
          ...glassSheetScreenOptions,
          sheetAllowedDetents: [0.75, 1.0],
          title: "Guia de Fotos",
        }}
      />
      <Stack.Screen
        name="compare"
        options={{
          ...glassSheetScreenOptions,
          sheetAllowedDetents: [0.75, 1.0],
          title: "Comparar",
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          ...detailStackScreenOptions,
          headerShown: true,
          title: "Análise",
        }}
      />
    </Stack>
  );
}
