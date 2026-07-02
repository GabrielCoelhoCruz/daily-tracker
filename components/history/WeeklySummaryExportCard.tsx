import { useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { AppIcon } from "@/components/ui/AppIcon";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { usePhysiqueStore } from "@/stores/usePhysiqueStore";
import { useAthleteStore } from "@/stores/useAthleteStore";
import { getLogicalDate } from "@/utils/dateUtils";
import {
  buildWeeklySummaryText,
  getSummaryTitle,
} from "@/utils/weeklySummaryUtils";

/**
 * Exporta o resumo semanal em texto PT-BR — "Resumo para coach" quando o
 * atleta tem coach, "Resumo da semana" quando não tem.
 */
export function WeeklySummaryExportCard() {
  const dias = useHistoryStore((s) => s.dias);
  const checkIns = usePhysiqueStore((s) => s.checkIns);
  const hasCoach = useAthleteStore((s) => s.hasCoach);
  const [shared, setShared] = useState(false);

  const title = getSummaryTitle(hasCoach);

  async function handleShare() {
    const message = buildWeeklySummaryText({
      dias,
      checkIns,
      todayDate: getLogicalDate(new Date()),
      hasCoach,
    });
    try {
      await Share.share({ message });
      setShared(true);
    } catch {
      // Usuário cancelou o share sheet — nada a fazer.
    }
  }

  return (
    <Card>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <AppIcon
            sf="square.and.arrow.up"
            mci="export-variant"
            size={20}
            color={theme.colors.accent.DEFAULT}
          />
          <View style={{ flex: 1 }}>
            <Text style={theme.typography.callout}>{title}</Text>
            <Text style={theme.typography.caption}>
              Texto pronto com execução, vazamentos, peso e check-in. Dados não
              registrados aparecem como "não registrado".
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel={title}
          testID="summary-export-cta"
          style={{
            minHeight: 48,
            borderRadius: theme.radius.md,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: withAlpha(theme.colors.accent.DEFAULT, 0.15),
            borderWidth: 1,
            borderColor: theme.colors.accent.DEFAULT,
          }}
        >
          <Text
            style={{
              ...theme.typography.callout,
              color: theme.colors.accent.DEFAULT,
              fontWeight: "700",
            }}
          >
            {shared ? "Compartilhar novamente" : "Copiar / compartilhar"}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
