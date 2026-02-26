import { Text, View } from "react-native";
import { theme } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import type { Exercicio, Serie } from "@/data/treinos";

const SERIE_COLORS: Record<Serie["tipo"], string> = {
  WS: theme.colors.accent.DEFAULT,
  TS: theme.colors.semantic.error,
  BS: theme.colors.semantic.success,
  CS: theme.colors.semantic.warning,
};

function SerieBadge({ serie }: { serie: Serie }) {
  const color = SERIE_COLORS[serie.tipo];
  const label = serie.reps
    ? `${serie.series}x${serie.reps}`
    : `${serie.series}x`;

  return (
    <View className="flex-row items-center gap-1.5">
      <View
        style={{
          backgroundColor: color + "20",
          borderRadius: 6,
          borderCurve: "continuous",
          paddingHorizontal: 6,
          paddingVertical: 2,
        }}
      >
        <Text
          style={{
            ...theme.typography.caption,
            fontWeight: "700",
            color,
          }}
        >
          {serie.tipo}
        </Text>
      </View>
      <Text style={theme.typography.caption}>{label}</Text>
      {serie.observacao && (
        <Text
          style={{ ...theme.typography.caption, color: theme.colors.text.muted }}
        >
          ({serie.observacao})
        </Text>
      )}
    </View>
  );
}

type ExercicioItemProps = {
  exercicio: Exercicio;
  index: number;
};

export function ExercicioItem({ exercicio, index }: ExercicioItemProps) {
  return (
    <Card className="p-0">
      <View className="flex-row items-start gap-3 p-3">
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.colors.accent.DEFAULT + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              ...theme.typography.footnote,
              fontWeight: "700",
              color: theme.colors.accent.DEFAULT,
            }}
          >
            {index + 1}
          </Text>
        </View>
        <View className="flex-1 gap-1">
          <Text style={theme.typography.callout}>{exercicio.nome}</Text>
          {exercicio.observacao && (
            <Text
              style={{
                ...theme.typography.caption,
                color: theme.colors.text.muted,
              }}
            >
              {exercicio.observacao}
            </Text>
          )}
        </View>
      </View>

      <View
        className="flex-row flex-wrap gap-2 px-3 pb-3"
        style={{ marginLeft: 40 }}
      >
        {exercicio.series.map((serie, i) => (
          <SerieBadge key={`${serie.tipo}-${i}`} serie={serie} />
        ))}
      </View>
    </Card>
  );
}
