import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { PrepReviewSummary } from "@/utils/prepReviewUtils";

type WeeklyReviewCardProps = {
  summary: PrepReviewSummary;
};

function formatWeeklySubtitle(summary: PrepReviewSummary): string {
  const strongCount =
    summary.strongDaysThisWeek + summary.perfectDaysThisWeek;
  const parts: string[] = [];

  if (strongCount > 0) {
    parts.push(
      `${strongCount} ${strongCount === 1 ? "dia forte" : "dias fortes"}`
    );
  }
  if (summary.weakDaysThisWeek > 0) {
    parts.push(
      `${summary.weakDaysThisWeek} ${summary.weakDaysThisWeek === 1 ? "dia fraco" : "dias fracos"}`
    );
  }

  return parts.join(" · ");
}

export function WeeklyReviewCard({ summary }: WeeklyReviewCardProps) {
  const hasWeeklyData = summary.loggedDaysThisWeek > 0;

  return (
    <View
      style={{
        borderRadius: theme.radius["2xl"],
        backgroundColor: theme.colors.surface.containerHigh,
        borderWidth: 1,
        borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.06),
        padding: 20,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon
          sf="calendar.badge.clock"
          mci="calendar-clock"
          size={16}
          color={theme.colors.onSurface.variant}
        />
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Esta Semana
        </Text>
      </View>

      {hasWeeklyData ? (
        <>
          <Text
            style={{
              ...theme.typography.title3,
              fontSize: 28,
              fontWeight: "700",
              fontVariant: ["tabular-nums"],
              color:
                summary.weeklyAdherence !== null &&
                summary.weeklyAdherence >= 80
                  ? theme.colors.semantic.success
                  : summary.weeklyAdherence !== null &&
                      summary.weeklyAdherence >= 60
                    ? theme.colors.primary.DEFAULT
                    : theme.colors.onSurface.DEFAULT,
            }}
          >
            {summary.weeklyAdherence}% aderência
          </Text>
          <Text style={{ ...theme.typography.footnote }}>
            {formatWeeklySubtitle(summary)}
          </Text>
        </>
      ) : (
        <Text
          style={{
            ...theme.typography.title3,
            fontSize: 20,
            fontWeight: "600",
            color: theme.colors.onSurface.variant,
          }}
        >
          Nenhum dia registrado ainda
        </Text>
      )}
    </View>
  );
}
