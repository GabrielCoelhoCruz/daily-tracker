import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { theme } from "@/constants/theme";
import { ProgressBar } from "@/components/checklist/ProgressBar";
import { AppIcon } from "@/components/ui/AppIcon";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { formatPtBR } from "@/utils/dateUtils";

function getStatusText(completados: number, total: number): string {
  if (total === 0) return "Sem dados";
  if (completados >= total) return "Completo";
  return "Parcial";
}

function getStatusColor(completados: number, total: number): string {
  if (total === 0) return theme.colors.text.muted;
  if (completados >= total) return theme.colors.semantic.success;
  const pct = completados / total;
  if (pct >= 0.5) return theme.colors.accent.DEFAULT;
  return theme.colors.semantic.error;
}

export default function DiaDetalheScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const historico = useHistoryStore((s) => (date ? s.dias[date] : undefined));

  if (!historico) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <AppIcon
          sf="calendar"
          mci="calendar-outline"
          size={48}
          color={theme.colors.text.muted}
        />
        <Text style={{ ...theme.typography.body, color: theme.colors.text.muted, marginTop: 16 }}>
          Nenhum dado encontrado
        </Text>
      </View>
    );
  }

  const statusText = getStatusText(historico.completados, historico.total);
  const statusColor = getStatusColor(historico.completados, historico.total);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <Text selectable style={theme.typography.headline}>
        {formatPtBR(historico.data)}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf={historico.completados >= historico.total ? "checkmark.circle.fill" : "exclamationmark.circle.fill"}
          mci={historico.completados >= historico.total ? "check-circle" : "alert-circle"}
          size={20}
          color={statusColor}
        />
        <Text style={{ ...theme.typography.footnote, fontWeight: "500", color: statusColor }}>
          {statusText}
        </Text>
      </View>

      <ProgressBar
        completados={historico.completados}
        total={historico.total}
      />

      {historico.itensPerdidos.length > 0 && (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <AppIcon
              sf="xmark.circle"
              mci="close-circle-outline"
              size={16}
              color={theme.colors.semantic.error}
            />
            <Text style={{ ...theme.typography.footnote, fontWeight: "500", color: theme.colors.text.secondary }}>
              Itens perdidos ({historico.itensPerdidos.length})
            </Text>
          </View>

          {historico.itensPerdidos.map((item, index) => (
            <View key={`${index}-${item}`} style={{ marginLeft: 24, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  height: 6,
                  width: 6,
                  borderRadius: 3,
                  backgroundColor: theme.colors.semantic.error,
                }}
              />
              <Text selectable style={{ ...theme.typography.body, fontSize: 14 }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}

      {historico.itensPerdidos.length === 0 &&
        historico.completados >= historico.total && (
          <View
            style={{
              alignItems: "center",
              gap: 8,
              borderRadius: theme.radius.lg,
              borderCurve: "continuous",
              backgroundColor: theme.colors.bg.elevated,
              paddingVertical: 16,
            }}
          >
            <AppIcon
              sf="trophy.fill"
              mci="trophy-outline"
              size={28}
              color={theme.colors.semantic.success}
            />
            <Text
              style={{
                ...theme.typography.footnote,
                fontWeight: "500",
                color: theme.colors.semantic.success,
              }}
            >
              Todos os itens completados!
            </Text>
          </View>
        )}
    </ScrollView>
  );
}
