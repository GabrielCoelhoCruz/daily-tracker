import { useState, useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { Calendario } from "@/components/historico/Calendario";
import { StatsCard } from "@/components/historico/StatsCard";
import { DiaDetalhe } from "@/components/historico/DiaDetalhe";
import { useHistoryStore, type HistoricoDia } from "@/stores/useHistoryStore";

export default function HistoricoScreen() {
  const [selectedDay, setSelectedDay] = useState<HistoricoDia | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const dias = useHistoryStore((s) => s.dias);
  const hasHistory = Object.keys(dias).length > 0;

  const handleDayPress = useCallback(
    (dateStr: string) => {
      const historico = dias[dateStr];
      if (historico) {
        setSelectedDay(historico);
        setDetailVisible(true);
      }
    },
    [dias]
  );

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
  }, []);

  return (
    <View className="flex-1 bg-bg-primary">
      <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
        {hasHistory ? (
          <>
            <Calendario onDayPress={handleDayPress} />
            <StatsCard />
          </>
        ) : (
          <View className="items-center gap-3 py-16">
            <Ionicons
              name="calendar-outline"
              size={48}
              color={theme.colors.text.muted}
            />
            <Text className="text-base text-txt-muted">
              Nenhum dado ainda
            </Text>
            <Text className="text-center text-sm text-txt-muted">
              Complete seu primeiro dia para ver{"\n"}o histórico aqui
            </Text>
          </View>
        )}
      </ScrollView>

      <DiaDetalhe
        historico={selectedDay}
        visible={detailVisible}
        onClose={handleCloseDetail}
      />
    </View>
  );
}
