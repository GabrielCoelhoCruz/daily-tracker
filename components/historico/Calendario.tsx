import { useState, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme, withAlpha } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { AppIcon } from "@/components/ui/AppIcon";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useAppFocusRefresh } from "@/utils/useAppFocusRefresh";
import { getLogicalDate } from "@/utils/dateUtils";
import {
  getCalendarDayTone,
  type CalendarDayTone,
} from "@/utils/prepReviewUtils";

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

function getTodayStr(): string {
  return getLogicalDate(new Date());
}

function getToneBackgroundColor(tone: CalendarDayTone): string {
  switch (tone) {
    case "perfect":
    case "strong":
      return theme.colors.semantic.success;
    case "partial":
      return theme.colors.accent.DEFAULT;
    case "weak":
      return theme.colors.semantic.error;
    default:
      return withAlpha(theme.colors.onSurface.DEFAULT, 0.04);
  }
}

function formatDateStr(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
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

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: 0, dateStr: "", isCurrentMonth: false });
  }

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
    <Card>
      <View className="mb-4 flex-row items-center gap-2">
        <AppIcon
          sf="calendar"
          mci="calendar-month-outline"
          size={18}
          color={theme.colors.onSurface.variant}
        />
        <Text style={theme.typography.callout}>Calendário</Text>
      </View>

      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={goToPrevMonth}
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
          className="p-2"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={20}
            color={theme.colors.text.primary}
          />
        </Pressable>
        <Text style={theme.typography.callout}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <Pressable
          onPress={goToNextMonth}
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          className="p-2"
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={theme.colors.text.primary}
          />
        </Pressable>
      </View>

      <View className="mb-2 flex-row">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center">
            <Text style={theme.typography.caption}>{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {calendarDays.map((cell, index) => {
          if (!cell.isCurrentMonth) {
            return <View key={`empty-${index}`} style={{ width: "14.28%" }} />;
          }

          const historico = dias[cell.dateStr];
          const tone = getCalendarDayTone(cell.dateStr, todayStr, historico);
          const isToday = tone === "today" || cell.dateStr === todayStr;
          const future = tone === "future";
          const showAdherence =
            tone === "perfect" ||
            tone === "strong" ||
            tone === "partial" ||
            tone === "weak";
          const bgColor = getToneBackgroundColor(tone);
          const hasHistory = Boolean(historico);

          return (
            <Pressable
              key={cell.dateStr}
              onPress={() => handleDayPress(cell)}
              disabled={!hasHistory}
              accessibilityRole={hasHistory ? "button" : undefined}
              accessibilityLabel={`${cell.day} de ${MONTH_NAMES[viewMonth]}${isToday ? ", hoje" : ""}`}
              style={{
                width: "14.28%",
                aspectRatio: 1,
                padding: 3,
              }}
            >
              <View
                style={[
                  {
                    flex: 1,
                    borderRadius: 10,
                    borderCurve: "continuous",
                    backgroundColor: bgColor,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  isToday && {
                    borderWidth: 2.5,
                    borderColor: theme.colors.primary.DEFAULT,
                  },
                ]}
              >
                <Text
                  style={{
                    ...theme.typography.footnote,
                    fontWeight: isToday ? "800" : "500",
                    fontVariant: ["tabular-nums"],
                    color: showAdherence
                      ? theme.colors.background
                      : future
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
    </Card>
  );
}
