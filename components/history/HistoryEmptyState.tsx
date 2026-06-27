import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";

export function HistoryEmptyState() {
  return (
    <View
      style={{
        alignItems: "center",
        gap: 12,
        paddingVertical: 48,
        paddingHorizontal: 24,
        borderRadius: theme.radius["2xl"],
        backgroundColor: theme.colors.surface.container,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.04),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppIcon
          sf="calendar.badge.clock"
          mci="calendar-clock"
          size={32}
          color={theme.colors.onSurface.variant}
        />
      </View>
      <Text
        style={{
          ...theme.typography.callout,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        Nenhum registro ainda
      </Text>
      <Text
        style={{
          ...theme.typography.footnote,
          textAlign: "center",
          lineHeight: 20,
          color: theme.colors.onSurface.variant,
        }}
      >
        Complete seu primeiro dia para desbloquear{"\n"}padrões semanais de
        preparação.
      </Text>
    </View>
  );
}
