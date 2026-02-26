import { useMemo } from "react";
import { Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { useHistoryStore, type HistoricoDia } from "@/stores/useHistoryStore";

function getWeekBounds(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return { start: fmt(monday), end: fmt(sunday) };
}

function getMonthPrefix(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function calcStreak(dias: Record<string, HistoricoDia>): number {
  const today = new Date();
  let streak = 0;
  const d = new Date(today);

  // Check yesterday first (today might still be in progress)
  d.setDate(d.getDate() - 1);

  while (true) {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const entry = dias[dateStr];
    if (!entry || entry.total === 0 || entry.completados < entry.total) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }

  // Also check today if it has a complete entry
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayEntry = dias[todayStr];
  if (todayEntry && todayEntry.total > 0 && todayEntry.completados >= todayEntry.total) {
    streak++;
  }

  return streak;
}

function calcAdherence(
  dias: Record<string, HistoricoDia>,
  filter: (dateStr: string) => boolean
): number | null {
  let totalComp = 0;
  let totalItems = 0;

  for (const [dateStr, entry] of Object.entries(dias)) {
    if (!filter(dateStr)) continue;
    totalComp += entry.completados;
    totalItems += entry.total;
  }

  if (totalItems === 0) return null;
  return Math.round((totalComp / totalItems) * 100);
}

type MissedItem = { nome: string; count: number; percentage: number };

function calcTopMissed(
  dias: Record<string, HistoricoDia>,
  top: number
): MissedItem[] {
  const missCounts: Record<string, number> = {};
  let totalDays = 0;

  for (const entry of Object.values(dias)) {
    totalDays++;
    for (const item of entry.itensPerdidos) {
      missCounts[item] = (missCounts[item] || 0) + 1;
    }
  }

  if (totalDays === 0) return [];

  return Object.entries(missCounts)
    .map(([nome, count]) => ({
      nome,
      count,
      percentage: Math.round((count / totalDays) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

function StatRow({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons name={icon} size={16} color={color} />
        <Text className="text-sm text-txt-secondary">{label}</Text>
      </View>
      <Text className="text-sm font-semibold" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}

export function StatsCard() {
  const dias = useHistoryStore((s) => s.dias);

  const streak = useMemo(() => calcStreak(dias), [dias]);

  const weekBounds = useMemo(() => getWeekBounds(), []);
  const monthPrefix = useMemo(() => getMonthPrefix(), []);

  const weeklyAdherence = useMemo(
    () =>
      calcAdherence(
        dias,
        (d) => d >= weekBounds.start && d <= weekBounds.end
      ),
    [dias, weekBounds]
  );

  const monthlyAdherence = useMemo(
    () => calcAdherence(dias, (d) => d.startsWith(monthPrefix)),
    [dias, monthPrefix]
  );

  const topMissed = useMemo(() => calcTopMissed(dias, 3), [dias]);

  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons
          name="chart-bar"
          size={20}
          color={theme.colors.accent.DEFAULT}
        />
        <Text className="text-base font-semibold text-txt-primary">
          Estatísticas
        </Text>
      </View>

      <StatRow
        icon="fire"
        label="Streak"
        value={`${streak} dia${streak !== 1 ? "s" : ""} consecutivo${streak !== 1 ? "s" : ""} 100%`}
        color={
          streak > 0
            ? theme.colors.semantic.success
            : theme.colors.text.muted
        }
      />

      <View className="h-px bg-border" />

      <StatRow
        icon="calendar-month-outline"
        label="Aderência semanal"
        value={weeklyAdherence !== null ? `${weeklyAdherence}%` : "—"}
        color={
          weeklyAdherence !== null && weeklyAdherence >= 80
            ? theme.colors.semantic.success
            : weeklyAdherence !== null && weeklyAdherence >= 50
              ? theme.colors.accent.DEFAULT
              : theme.colors.text.muted
        }
      />

      <StatRow
        icon="calendar-month"
        label="Aderência mensal"
        value={monthlyAdherence !== null ? `${monthlyAdherence}%` : "—"}
        color={
          monthlyAdherence !== null && monthlyAdherence >= 80
            ? theme.colors.semantic.success
            : monthlyAdherence !== null && monthlyAdherence >= 50
              ? theme.colors.accent.DEFAULT
              : theme.colors.text.muted
        }
      />

      {topMissed.length > 0 && (
        <>
          <View className="h-px bg-border" />

          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={16}
                color={theme.colors.semantic.error}
              />
              <Text className="text-sm text-txt-secondary">
                Top 3 itens mais esquecidos
              </Text>
            </View>

            {topMissed.map((item) => (
              <View
                key={item.nome}
                className="ml-6 flex-row items-center justify-between"
              >
                <Text
                  className="flex-1 text-sm text-txt-primary"
                  numberOfLines={1}
                >
                  {item.nome}
                </Text>
                <Text
                  className="text-xs font-medium"
                  style={{ color: theme.colors.semantic.error }}
                >
                  {item.percentage}% ({item.count}x)
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Card>
  );
}
