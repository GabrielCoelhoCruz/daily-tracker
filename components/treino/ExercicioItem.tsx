import { Platform, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme, withAlpha } from "@/constants/theme";
import type { Exercicio, Serie } from "@/data/treinos";

const SERIE_COLORS: Record<Serie["tipo"], string> = {
  WS: theme.colors.primary.DEFAULT,
  TS: theme.colors.semantic.error,
  BS: theme.colors.semantic.success,
  CS: theme.colors.semantic.warning,
};

const SERIE_LABELS: Record<Serie["tipo"], string> = {
  WS: "WORK",
  TS: "TOP",
  BS: "BACK-OFF",
  CS: "CLUSTER",
};

function getTotalSets(exercicio: Exercicio): number {
  return exercicio.series.reduce((acc, s) => acc + s.series, 0);
}

// ─── Focal Card (first exercise, hero treatment) ────────────────────

type ExercicioItemProps = {
  exercicio: Exercicio;
  index: number;
};

export function FocalExercicioCard({ exercicio }: ExercicioItemProps) {
  const totalSets = getTotalSets(exercicio);

  return (
    <View>
      <LinearGradient
        colors={[
          theme.colors.surface.container,
          theme.colors.surface.containerLowest,
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 24,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.05)",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.5,
              shadowRadius: 40,
            },
            android: { elevation: 8 },
          }),
        }}
      >
        {/* Set count + series type indicators */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                backgroundColor: theme.colors.primary.container,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  ...theme.typography.overline,
                  fontSize: 11,
                  letterSpacing: -0.5,
                  color: theme.colors.background,
                }}
              >
                {totalSets} Sets
              </Text>
            </View>
            <Text style={theme.typography.labelSmall}>
              {exercicio.series.length} tipos
            </Text>
          </View>

          {/* Series type dots */}
          <View style={{ flexDirection: "row", gap: 6 }}>
            {exercicio.series.map((serie, i) =>
              Array.from({ length: serie.series }).map((_, j) => (
                <View
                  key={`${i}-${j}`}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: withAlpha(SERIE_COLORS[serie.tipo], 0.6),
                  }}
                />
              ))
            )}
          </View>
        </View>

        {/* Exercise name */}
        <Text
          style={{
            ...theme.typography.headlineLarge,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {exercicio.nome}
        </Text>

        {/* Observação */}
        {exercicio.observacao && (
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.onSurface.variant,
              marginBottom: 12,
            }}
          >
            {exercicio.observacao}
          </Text>
        )}

        {/* Series details */}
        <View style={{ gap: 8, marginTop: 16 }}>
          {exercicio.series.map((serie, i) => {
            const color = SERIE_COLORS[serie.tipo];
            const label = serie.reps
              ? `${serie.series}x${serie.reps}`
              : `${serie.series}x`;

            return (
              <View
                key={`${serie.tipo}-${i}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    backgroundColor: withAlpha(color, 0.15),
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    minWidth: 56,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "900",
                      color,
                      letterSpacing: 1,
                    }}
                  >
                    {serie.tipo}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: theme.colors.onSurface.DEFAULT,
                    letterSpacing: -0.3,
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    ...theme.typography.overline,
                  }}
                >
                  {SERIE_LABELS[serie.tipo]}
                </Text>
                {serie.observacao && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: theme.colors.text.muted,
                      fontStyle: "italic",
                    }}
                  >
                    {serie.observacao}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

// ─── Compact Card (secondary exercises) ─────────────────────────────

export function ExercicioItem({ exercicio, index }: ExercicioItemProps) {
  const totalSets = getTotalSets(exercicio);

  // Collect rep info from the first WS serie that has reps, else from any
  const primaryReps =
    exercicio.series.find((s) => s.tipo === "WS" && s.reps)?.reps ??
    exercicio.series.find((s) => s.reps)?.reps;

  return (
    <View
      style={{
        backgroundColor: withAlpha(theme.colors.surface.containerLow, 0.3),
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        minHeight: 76,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        {/* Number box */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: theme.colors.surface.containerHighest,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "900",
              color: theme.colors.onSurface.variant,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </Text>
        </View>

        {/* Exercise info */}
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: theme.colors.onSurface.DEFAULT,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
            numberOfLines={1}
          >
            {exercicio.nome}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text
                style={{
                  ...theme.typography.overline,
                  color: theme.colors.primary.DEFAULT,
                }}
              >
                {totalSets} Sets
              </Text>

            {primaryReps != null && (
              <>
                <View
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                />
                <Text
                  style={{
                    ...theme.typography.overline,
                  }}
                >
                  {primaryReps} Reps
                </Text>
              </>
            )}

            {/* Serie type indicators */}
            <View
              style={{ flexDirection: "row", gap: 4, marginLeft: 4 }}
            >
              {exercicio.series.map((serie, i) => (
                <View
                  key={`${serie.tipo}-${i}`}
                  style={{
                    backgroundColor: withAlpha(SERIE_COLORS[serie.tipo], 0.2),
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                    borderRadius: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: "800",
                      color: SERIE_COLORS[serie.tipo],
                      letterSpacing: 0.5,
                    }}
                  >
                    {serie.tipo}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
