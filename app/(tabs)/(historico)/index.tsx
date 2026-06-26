import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import { Calendario } from "@/components/historico/Calendario";
import { StatsCard } from "@/components/historico/StatsCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";
import { useHistoryStore } from "@/stores/useHistoryStore";

export default function HistoricoScreen() {
  const router = useRouter();
  const dias = useHistoryStore((s) => s.dias);
  const hasHistory = Object.keys(dias).length > 0;
  const bottomPadding = useTabContentBottomPadding();

  const handleDayPress = useCallback(
    (dateStr: string) => {
      const historico = dias[dateStr];
      if (historico) {
        router.push(`/dia-detalhe?date=${dateStr}`);
      }
    },
    [dias, router]
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: bottomPadding,
          gap: 12,
        }}
      >
        {hasHistory ? (
          <>
            <Calendario onDayPress={handleDayPress} />
            <StatsCard />
          </>
        ) : (
          <View style={{ alignItems: "center", gap: 12, paddingVertical: 64 }}>
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={48}
              color={theme.colors.text.muted}
            />
            <Text style={{ ...theme.typography.body, color: theme.colors.text.muted }}>
              Nenhum dado ainda
            </Text>
            <Text style={{ ...theme.typography.footnote, textAlign: "center" }}>
              Complete seu primeiro dia para ver{"\n"}o hist{"\u00f3"}rico aqui
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
