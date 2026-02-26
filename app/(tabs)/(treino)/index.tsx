import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { getTreinoDoDia } from "@/utils/diaUtils";
import { useDayStore } from "@/stores/useDayStore";
import { getLogicalDayOfWeek } from "@/utils/dateUtils";
import { ExercicioItem } from "@/components/treino/ExercicioItem";
import { DicasSection } from "@/components/dicas/DicasSection";

const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Ter\u00e7a",
  "Quarta",
  "Quinta",
  "Sexta",
  "S\u00e1bado",
];

export default function TreinoScreen() {
  const dayOfWeek = getLogicalDayOfWeek(new Date());
  const diaOffManual = useDayStore((s) => s.diaOffManual);
  const treino = diaOffManual ? null : getTreinoDoDia(dayOfWeek);
  const dayName = DAY_NAMES[dayOfWeek];

  if (!treino) {
    return (
      <ScrollView
        className="flex-1 bg-bg-primary"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="flex-1 items-center justify-center px-8"
      >
        <Ionicons
          name="moon-outline"
          size={64}
          color={theme.colors.text.muted}
        />
        <Text className="mt-4 text-xl font-bold text-txt-primary">
          Dia Off \u2014 Descanse
        </Text>
        <Text className="mt-2 text-center text-sm text-txt-secondary">
          {dayName}. Aproveite para recuperar e voltar mais forte.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-bg-primary"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-4 px-4 pb-8 pt-4"
    >
      <View className="gap-1">
        <Text className="text-lg font-bold text-txt-primary">
          {dayName} \u2014 {treino.letra}: {treino.grupoMuscular}
        </Text>
        <Text className="text-sm text-txt-muted">
          {treino.exercicios.length} exerc\u00edcios
        </Text>
      </View>

      <View className="gap-2">
        {treino.exercicios.map((exercicio, index) => (
          <ExercicioItem
            key={exercicio.id}
            exercicio={exercicio}
            index={index}
          />
        ))}
      </View>

      <DicasSection categoria="treino" />
    </ScrollView>
  );
}
