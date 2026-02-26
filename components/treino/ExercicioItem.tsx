import { Text, View } from "react-native";
import { theme } from "@/constants/theme";
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
        className="rounded px-1.5 py-0.5"
        style={{ backgroundColor: color + "20" }}
      >
        <Text className="text-xs font-bold" style={{ color }}>
          {serie.tipo}
        </Text>
      </View>
      <Text className="text-xs text-txt-secondary">{label}</Text>
      {serie.observacao && (
        <Text className="text-xs text-txt-muted">({serie.observacao})</Text>
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
    <View className="gap-2 rounded-lg bg-bg-elevated p-3">
      <View className="flex-row items-start gap-2">
        <Text
          className="mt-0.5 text-xs font-bold"
          style={{ color: theme.colors.accent.DEFAULT }}
        >
          {index + 1}.
        </Text>
        <View className="flex-1 gap-1">
          <Text className="text-sm font-medium text-txt-primary">
            {exercicio.nome}
          </Text>
          {exercicio.observacao && (
            <Text className="text-xs text-txt-muted">
              {exercicio.observacao}
            </Text>
          )}
        </View>
      </View>

      <View className="ml-5 flex-row flex-wrap gap-2">
        {exercicio.series.map((serie, i) => (
          <SerieBadge key={`${serie.tipo}-${i}`} serie={serie} />
        ))}
      </View>
    </View>
  );
}
