import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs tintColor="#f59e0b">
      <NativeTabs.Trigger name="(hoje)">
        <Icon
          sf={{ default: "checkmark.circle", selected: "checkmark.circle.fill" }}
        />
        <Label>Hoje</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(treino)">
        <Icon
          sf={{ default: "dumbbell", selected: "dumbbell.fill" }}
        />
        <Label>Treino</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(historico)">
        <Icon sf={{ default: "calendar", selected: "calendar" }} />
        <Label>Histórico</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
