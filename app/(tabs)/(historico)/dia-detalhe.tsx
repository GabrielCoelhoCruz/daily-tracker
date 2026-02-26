import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import { ProgressBar } from "@/components/checklist/ProgressBar";
import { useHistoryStore } from "@/stores/useHistoryStore";

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
      <View className="flex-1 items-center justify-center bg-bg-card px-8">
        <MaterialCommunityIcons
          name="calendar-outline"
          size={48}
          color={theme.colors.text.muted}
        />
        <Text className="mt-4" style={{ ...theme.typography.body, color: theme.colors.text.muted }}>
          Nenhum dado encontrado
        </Text>
      </View>
    );
  }

  const statusText = getStatusText(historico.completados, historico.total);
  const statusColor = getStatusColor(historico.completados, historico.total);

  return (
    <View className="flex-1 bg-bg-card px-5 pt-4 pb-8">
      {/* Header */}
      <Text className="mb-4" style={theme.typography.headline}>
        {formatDisplayDate(historico.data)}
      </Text>

      {/* Status */}
      <View className="mb-4 flex-row items-center gap-2">
        <MaterialCommunityIcons
          name={
            historico.completados >= historico.total
              ? "check-circle"
              : "alert-circle"
          }
          size={20}
          color={statusColor}
        />
        <Text style={{ ...theme.typography.footnote, fontWeight: "500", color: statusColor }}>
          {statusText}
        </Text>
      </View>

      {/* Progress bar */}
      <ProgressBar
        completados={historico.completados}
        total={historico.total}
        className="mb-4"
      />

      {/* Missed items */}
      {historico.itensPerdidos.length > 0 && (
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={16}
              color={theme.colors.semantic.error}
            />
            <Text className="text-sm font-medium text-txt-secondary">
              Itens perdidos ({historico.itensPerdidos.length})
            </Text>
          </View>

          {historico.itensPerdidos.map((item, index) => (
            <View key={`${index}-${item}`} className="ml-6 flex-row items-center gap-2">
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: theme.colors.semantic.error }}
              />
              <Text className="text-sm text-txt-primary">{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* All complete message */}
      {historico.itensPerdidos.length === 0 &&
        historico.completados >= historico.total && (
          <View className="items-center gap-2 rounded-lg bg-bg-elevated py-4">
            <MaterialCommunityIcons
              name="trophy-outline"
              size={28}
              color={theme.colors.semantic.success}
            />
            <Text
              className="text-sm font-medium"
              style={{ color: theme.colors.semantic.success }}
            >
              Todos os itens completados!
            </Text>
          </View>
        )}
    </View>
  );
}
