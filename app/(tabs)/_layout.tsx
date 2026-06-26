import { NativeTabs, Icon, Label, VectorIcon } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS, Platform } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";

export const unstable_settings = {
  initialRouteName: "(hoje)",
};

// Liquid Glass tint adapts to light/dark background on iOS 26; DynamicColorIOS
// keeps the tab tint legible across both modes. On Android this is a plain
// accent color (Material 3 tabs).
const tabTint =
  Platform.OS === "ios"
    ? DynamicColorIOS({
        dark: theme.colors.primary.DEFAULT,
        light: theme.colors.primary.container,
      })
    : theme.colors.primary.DEFAULT;

export default function TabLayout() {
  return (
    <NativeTabs tintColor={tabTint}>
      <NativeTabs.Trigger name="(hoje)">
        <Icon
          sf={{ default: "checkmark.circle", selected: "checkmark.circle.fill" }}
          androidSrc={
            Platform.OS === "android"
              ? {
                  default: <VectorIcon family={MaterialCommunityIcons} name="check-circle-outline" />,
                  selected: <VectorIcon family={MaterialCommunityIcons} name="check-circle" />,
                }
              : undefined
          }
        />
        <Label>Dash</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(treino)">
        <Icon
          sf={{ default: "dumbbell", selected: "dumbbell.fill" }}
          androidSrc={
            Platform.OS === "android"
              ? {
                  default: <VectorIcon family={MaterialCommunityIcons} name="dumbbell" />,
                  selected: <VectorIcon family={MaterialCommunityIcons} name="dumbbell" />,
                }
              : undefined
          }
        />
        <Label>Train</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(historico)">
        <Icon
          sf={{ default: "calendar", selected: "calendar" }}
          androidSrc={
            Platform.OS === "android"
              ? {
                  default: <VectorIcon family={MaterialCommunityIcons} name="calendar-month-outline" />,
                  selected: <VectorIcon family={MaterialCommunityIcons} name="calendar-month" />,
                }
              : undefined
          }
        />
        <Label>Logs</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(progresso)">
        <Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          androidSrc={
            Platform.OS === "android"
              ? {
                  default: <VectorIcon family={MaterialCommunityIcons} name="chart-bar" />,
                  selected: <VectorIcon family={MaterialCommunityIcons} name="chart-bar" />,
                }
              : undefined
          }
        />
        <Label>Stats</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
