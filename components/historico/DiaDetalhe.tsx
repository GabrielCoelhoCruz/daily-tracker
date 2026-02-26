import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { ProgressBar } from "@/components/checklist/ProgressBar";
import type { HistoricoDia } from "@/stores/useHistoryStore";

type DiaDetalheProps = {
  historico: HistoricoDia | null;
  visible: boolean;
  onClose: () => void;
};

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

export function DiaDetalhe({ historico, visible, onClose }: DiaDetalheProps) {
  if (!historico) return null;

  const statusText = getStatusText(historico.completados, historico.total);
  const statusColor = getStatusColor(historico.completados, historico.total);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-t-2xl border-t border-border bg-bg-card px-5 pb-8 pt-4"
        >
          {/* Handle bar */}
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-bg-elevated" />
          </View>

          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-txt-primary">
              {formatDisplayDate(historico.data)}
            </Text>
            <Pressable onPress={onClose} className="p-1">
              <Ionicons
                name="close"
                size={22}
                color={theme.colors.text.muted}
              />
            </Pressable>
          </View>

          {/* Status */}
          <View className="mb-4 flex-row items-center gap-2">
            <Ionicons
              name={
                historico.completados >= historico.total
                  ? "checkmark-circle"
                  : "alert-circle"
              }
              size={20}
              color={statusColor}
            />
            <Text className="text-sm font-medium" style={{ color: statusColor }}>
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
                <Ionicons
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
                <Ionicons
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}
