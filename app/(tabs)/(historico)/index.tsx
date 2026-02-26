import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import { Calendario } from "@/components/historico/Calendario";
import { StatsCard } from "@/components/historico/StatsCard";
import { useHistoryStore } from "@/stores/useHistoryStore";

export default function HistoricoScreen() {
  const router = useRouter();
  const dias = useHistoryStore((s) => s.dias);
  const hasHistory = Object.keys(dias).length > 0;

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
    <ScrollView
      className="flex-1 bg-bg-primary"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-3 p-4 pb-8"
    >
      {hasHistory ? (
        <>
          <Calendario onDayPress={handleDayPress} />
          <StatsCard />
        </>
      ) : (
        <View className="items-center gap-3 py-16">
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={48}
            color={theme.colors.text.muted}
          />
          <Text style={{ ...theme.typography.body, color: theme.colors.text.muted }}>
            Nenhum dado ainda
          </Text>
          <Text className="text-center" style={theme.typography.footnote}>
            Complete seu primeiro dia para ver{"\n"}o hist{"\u00f3"}rico aqui
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
