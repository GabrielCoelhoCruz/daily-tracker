import { useState, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useAppFocusRefresh } from "@/utils/useAppFocusRefresh";

type CalendarioProps = {
  onDayPress?: (dateStr: string) => void;
};

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function getAdherenceColor(completados: number, total: number): string {
  if (total === 0) return "#404040";
  const pct = completados / total;
  if (pct >= 1) return theme.colors.semantic.success;
  if (pct >= 0.5) return theme.colors.accent.DEFAULT;
  return theme.colors.semantic.error;
}

function formatDateStr(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function getTodayStr(): string {
  const now = new Date();
  return formatDateStr(now.getFullYear(), now.getMonth(), now.getDate());
}

type DayCell = {
  day: number;
  dateStr: string;
  isCurrentMonth: boolean;
};

function getCalendarDays(year: number, month: number): DayCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: DayCell[] = [];

  // Empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: 0, dateStr: "", isCurrentMonth: false });
  }

  // Actual days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      dateStr: formatDateStr(year, month, d),
      isCurrentMonth: true,
    });
  }

  return cells;
}

export function Calendario({ onDayPress }: CalendarioProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const dias = useHistoryStore((s) => s.dias);

  const refreshKey = useAppFocusRefresh();
  const todayStr = useMemo(() => getTodayStr(), [refreshKey]);

  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const isFutureDate = (dateStr: string): boolean => {
    return dateStr > todayStr;
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayPress = (cell: DayCell) => {
    if (!cell.isCurrentMonth || !cell.dateStr) return;
    const historico = dias[cell.dateStr];
    if (historico && onDayPress) {
      onDayPress(cell.dateStr);
    }
  };

  return (
    <View className="rounded-xl border border-border bg-bg-card p-4">
      {/* Month navigation header */}
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable onPress={goToPrevMonth} className="p-2">
          <Ionicons
            name="chevron-back"
            size={20}
            color={theme.colors.text.primary}
          />
        </Pressable>
        <Text className="text-base font-semibold text-txt-primary">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <Pressable onPress={goToNextMonth} className="p-2">
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.primary}
          />
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View className="mb-2 flex-row">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center">
            <Text className="text-xs text-txt-muted">{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((cell, index) => {
          if (!cell.isCurrentMonth) {
            return <View key={`empty-${index}`} style={{ width: "14.28%" }} />;
          }

          const historico = dias[cell.dateStr];
          const future = isFutureDate(cell.dateStr);
          const isToday = cell.dateStr === todayStr;

          let bgColor = "#404040";
          if (historico && !future) {
            bgColor = getAdherenceColor(
              historico.completados,
              historico.total
            );
          }

          return (
            <Pressable
              key={cell.dateStr}
              onPress={() => handleDayPress(cell)}
              style={{
                width: "14.28%",
                aspectRatio: 1,
                padding: 2,
              }}
            >
              <View
                style={[
                  {
                    flex: 1,
                    borderRadius: 8,
                    borderCurve: "continuous",
                    backgroundColor: bgColor,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  isToday && {
                    borderWidth: 2,
                    borderColor: theme.colors.accent.DEFAULT,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isToday ? "700" : "500",
                    fontVariant: ["tabular-nums"],
                    color: future
                      ? theme.colors.text.muted
                      : theme.colors.text.primary,
                  }}
                >
                  {cell.day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
