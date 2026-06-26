import { ScrollView, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme, withAlpha } from "@/constants/theme";
import { getTreinoDoDia } from "@/utils/diaUtils";
import { useDayStore } from "@/stores/useDayStore";
import { getLogicalDayOfWeek } from "@/utils/dateUtils";
import {
  FocalExercicioCard,
  ExercicioItem,
} from "@/components/treino/ExercicioItem";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";

const DAY_NAMES = [
  "DOMINGO",
  "SEGUNDA",
  "TERÇA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SÁBADO",
];

export default function TreinoScreen() {
  const dayOfWeek = getLogicalDayOfWeek(new Date());
  const diaOffManual = useDayStore((s) => s.diaOffManual);
  const treino = diaOffManual ? null : getTreinoDoDia(dayOfWeek);
  const dayName = DAY_NAMES[dayOfWeek];
  const bottomPadding = useTabContentBottomPadding();

  // ─── Rest Day ──────────────────────────────────────────────────────

  if (!treino) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
            paddingVertical: 32,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: theme.colors.surface.container,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
              marginBottom: 20,
            }}
          >
            <MaterialCommunityIcons
              name="moon-waning-crescent"
              size={36}
              color={theme.colors.onSurface.variant}
            />
          </View>

          <Text style={theme.typography.labelSmall}>
            {dayName}
          </Text>
          <Text
            style={{
              ...theme.typography.headlineLarge,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            DIA OFF
          </Text>
          <Text
            style={{
              ...theme.typography.footnote,
              color: theme.colors.onSurface.variant,
              textAlign: "center",
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            Aproveite para recuperar e voltar mais forte.
          </Text>
        </ScrollView>
      </View>
    );
  }

  // ─── Training Day ──────────────────────────────────────────────────

  const [firstExercise, ...remainingExercises] = treino.exercicios;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: bottomPadding,
          paddingTop: 16,
        }}
      >
      {/* ── Header Section ── */}
      <View style={{ marginBottom: 32 }}>
        {/* Protocol label */}
        <Text
          style={{
            ...theme.typography.labelSmall,
            color: theme.colors.primary.container,
            marginBottom: 4,
          }}
        >
          PROTOCOLO • HOJE
        </Text>

        {/* Day name (large) */}
        <Text style={theme.typography.titleLarge}>{dayName}</Text>

        {/* Split info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
          }}
        >
          <MaterialCommunityIcons
            name="dumbbell"
            size={16}
            color={theme.colors.onSurface.variant}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: theme.colors.onSurface.variant,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Split {treino.letra}: {treino.grupoMuscular}
          </Text>
        </View>
      </View>

      {/* ── Focal Exercise (first) ── */}
      <View style={{ marginBottom: 8 }}>
        <FocalExercicioCard exercicio={firstExercise} index={0} />

        {/* Muscle group tags */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
            paddingHorizontal: 4,
          }}
        >
          <Text
            style={{
            fontSize: 9,
            fontWeight: "900",
            color: withAlpha(theme.colors.onSurface.variant, 0.4),
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Grupo:
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.surface.containerHigh,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: "900",
                color: theme.colors.onSurface.DEFAULT,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {treino.grupoMuscular}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Remaining Exercises ── */}
      {remainingExercises.length > 0 && (
        <View style={{ marginTop: 32 }}>
          {/* Section header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: withAlpha(theme.colors.onSurface.DEFAULT, 0.05),
              paddingBottom: 12,
              marginBottom: 16,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                ...theme.typography.labelSmall,
                color: withAlpha(theme.colors.onSurface.variant, 0.6),
              }}
            >
              PRÓXIMOS NO PROTOCOLO
            </Text>
            <Text
              style={{
                ...theme.typography.labelSmall,
                color: withAlpha(theme.colors.onSurface.variant, 0.4),
              }}
            >
              {remainingExercises.length} restantes
            </Text>
          </View>

          {/* Exercise list */}
          <View style={{ gap: 10 }}>
            {remainingExercises.map((exercicio, index) => (
              <ExercicioItem
                key={exercicio.id}
                exercicio={exercicio}
                index={index + 1}
              />
            ))}
          </View>
        </View>
      )}
      </ScrollView>
    </View>
  );
}
