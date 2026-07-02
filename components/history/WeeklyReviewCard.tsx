import { Text, View } from "react-native";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import type { WeeklyExecutionReview } from "@/utils/prepReviewUtils";

type WeeklyReviewCardProps = {
  review: WeeklyExecutionReview;
};

export function WeeklyReviewCard({ review }: WeeklyReviewCardProps) {
  const hasCloseoutData = review.closedDays > 0;

  const scoreColor =
    review.averageScore != null && review.averageScore >= 90
      ? theme.colors.semantic.success
      : review.averageScore != null && review.averageScore >= 75
        ? theme.colors.primary.DEFAULT
        : review.averageScore != null && review.averageScore >= 50
          ? theme.colors.accent.DEFAULT
          : review.averageScore != null
            ? theme.colors.semantic.error
            : theme.colors.onSurface.variant;

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
        <Text style={{ ...theme.typography.overline }}>Esta Semana</Text>
      </View>

      {hasCloseoutData && review.averageScore != null ? (
        <>
          <Text
            style={{
              ...theme.typography.title3,
              fontSize: 30,
              fontWeight: "800",
              letterSpacing: -1,
              fontVariant: ["tabular-nums"],
              color: scoreColor,
            }}
          >
            {review.averageScore}% execução
          </Text>
          <Text style={{ ...theme.typography.footnote }}>
            {review.closedDays}/{review.totalDays} dias fechados
            {review.daysWithLeaks > 0
              ? ` · ${review.daysWithLeaks} com vazamento`
              : " · sem vazamentos dominantes"}
          </Text>
        </>
      ) : hasCloseoutData ? (
        <>
          <Text
            style={{
              ...theme.typography.title3,
              fontSize: 22,
              fontWeight: "700",
              color: theme.colors.onSurface.DEFAULT,
            }}
          >
            {review.closedDays} fechamento
            {review.closedDays === 1 ? "" : "s"} esta semana
          </Text>
          <Text style={{ ...theme.typography.footnote }}>
            Score ainda não disponível nos fechamentos salvos.
          </Text>
        </>
      ) : (
        <>
          <Text
            style={{
              ...theme.typography.title3,
              fontSize: 20,
              fontWeight: "600",
              color: theme.colors.onSurface.variant,
            }}
          >
            Nenhum fechamento esta semana
          </Text>
          <Text style={{ ...theme.typography.footnote }}>
            Feche o dia na aba Hoje para registrar execução e vazamentos.
          </Text>
        </>
      )}
    </View>
  );
}
