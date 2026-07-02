import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { theme, withAlpha } from "@/constants/theme";
import { ProgressBar } from "@/components/checklist/ProgressBar";
import { AppIcon } from "@/components/ui/AppIcon";
import { CloseoutDayDetail } from "@/components/history/CloseoutDayDetail";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useGymStore } from "@/stores/useGymStore";
import { formatPtBR } from "@/utils/dateUtils";
import { formatGymSessionsForHistory } from "@/utils/gymLogUtils";

function getStatusText(completados: number, total: number): string {
  if (total === 0) return "Sem dados";
  if (completados >= total) return "Checklist completo";
  return "Checklist parcial";
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
  const gymSessionsRecord = useGymStore((s) => s.gymSessions);
  const gymSessions = useMemo(
    () =>
      date
        ? Object.values(gymSessionsRecord).filter(
            (session) => session.date === date,
          )
        : [],
    [gymSessionsRecord, date],
  );
  const gymHistoryCards = formatGymSessionsForHistory(gymSessions);

  if (!historico && gymHistoryCards.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
      >
        <AppIcon
          sf="calendar"
          mci="calendar-outline"
          size={48}
          color={theme.colors.text.muted}
        />
        <Text
          style={{
            ...theme.typography.body,
            color: theme.colors.text.muted,
            marginTop: 16,
          }}
        >
          Nenhum dado encontrado
        </Text>
      </View>
    );
  }

  const statusText = historico
    ? getStatusText(historico.completados, historico.total)
    : "Sem dados";
  const statusColor = historico
    ? getStatusColor(historico.completados, historico.total)
    : theme.colors.text.muted;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <Text selectable style={theme.typography.headline}>
        {historico ? formatPtBR(historico.data) : date ? formatPtBR(date) : ""}
      </Text>

      {historico ? <CloseoutDayDetail historico={historico} /> : null}

      {historico && (
        <>
          <View style={{ gap: 8 }}>
            <Text style={{ ...theme.typography.overline }}>
              Protocolo legado
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <AppIcon
                sf={
                  historico.completados >= historico.total
                    ? "checkmark.circle.fill"
                    : "exclamationmark.circle.fill"
                }
                mci={
                  historico.completados >= historico.total
                    ? "check-circle"
                    : "alert-circle"
                }
                size={20}
                color={statusColor}
              />
              <Text
                style={{
                  ...theme.typography.footnote,
                  fontWeight: "500",
                  color: statusColor,
                }}
              >
                {statusText}
              </Text>
            </View>
          </View>

          <ProgressBar
            completados={historico.completados}
            total={historico.total}
          />

          {historico.itensPerdidos.length > 0 && (
            <View style={{ gap: 8 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <AppIcon
                  sf="xmark.circle"
                  mci="close-circle-outline"
                  size={16}
                  color={theme.colors.semantic.error}
                />
                <Text
                  style={{
                    ...theme.typography.footnote,
                    fontWeight: "500",
                    color: theme.colors.text.secondary,
                  }}
                >
                  Itens perdidos ({historico.itensPerdidos.length})
                </Text>
              </View>

              {historico.itensPerdidos.map((item, index) => (
                <View
                  key={`${index}-${item}`}
                  style={{
                    marginLeft: 24,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
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
            historico.completados >= historico.total &&
            !historico.closeoutSavedAt && (
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
        </>
      )}

      {gymHistoryCards.length > 0 && (
        <View style={{ gap: 12 }}>
          <Text
            style={{
              ...theme.typography.footnote,
              fontWeight: "600",
              color: theme.colors.text.secondary,
            }}
          >
            Treino registrado
          </Text>
          {gymHistoryCards.map((card, index) => (
            <View
              key={`${card.title}-${index}`}
              style={{
                backgroundColor: theme.colors.surface.container,
                borderRadius: theme.radius.lg,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
                padding: 16,
                gap: 8,
              }}
            >
              <Text style={{ ...theme.typography.body, fontWeight: "700" }}>
                {card.title}
              </Text>
              {card.lines.map((line, lineIndex) => (
                <Text
                  key={`${lineIndex}-${line}`}
                  selectable
                  style={{
                    ...theme.typography.body,
                    fontSize: 14,
                    color: theme.colors.onSurface.variant,
                  }}
                >
                  {line}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
