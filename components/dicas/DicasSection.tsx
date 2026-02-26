import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { animateNext } from "@/utils/animationUtils";
import { dicas } from "@/data/dicas";
import type { Dica } from "@/data/plano";

type DicasSectionProps = {
  categoria: "nutricao" | "treino";
};

const SERIES_LEGEND: { sigla: string; nome: string; descricao: string }[] = [
  {
    sigla: "WS",
    nome: "Work Set",
    descricao: "Carga controlada, 6-12 reps. Descanso: 60-120seg.",
  },
  {
    sigla: "TS",
    nome: "Top Set",
    descricao: "Carga mais pesada, 6-10 reps. Descanso: 120-240seg.",
  },
  {
    sigla: "BS",
    nome: "Back-off Set",
    descricao: "Reduz 20-30% da carga, 12-15 reps.",
  },
  {
    sigla: "CS",
    nome: "Cluster Set",
    descricao: "Mini-series com 10-15seg de pausa intra-serie.",
  },
];

const SECTION_TITLES: Record<DicasSectionProps["categoria"], string> = {
  nutricao: "Dicas de Nutrição",
  treino: "Dicas de Treino",
};

function filterDicas(categoria: DicasSectionProps["categoria"]): Dica[] {
  return dicas.filter((d) => d.categoria === categoria);
}

function DicaItem({ dica }: { dica: Dica }) {
  return (
    <View className="flex-row gap-3 rounded-lg bg-bg-elevated p-3">
      <MaterialCommunityIcons
        name="information-outline"
        size={20}
        color={theme.colors.accent.DEFAULT}
        style={{ marginTop: 2 }}
      />
      <Text className="flex-1 text-sm leading-5 text-txt-secondary">
        {dica.texto}
      </Text>
    </View>
  );
}

function SeriesLegend() {
  return (
    <View className="gap-2 rounded-lg bg-bg-elevated p-3">
      <Text className="text-sm font-semibold text-txt-primary">
        Legenda de Séries
      </Text>
      {SERIES_LEGEND.map((item) => (
        <View key={item.sigla} className="flex-row items-start gap-2">
          <View
            style={{
              marginTop: 2,
              borderRadius: theme.radius.sm,
              borderCurve: "continuous",
              paddingHorizontal: 6,
              paddingVertical: 2,
              backgroundColor: theme.colors.accent.DEFAULT + "20",
            }}
          >
            <Text
              style={{
                ...theme.typography.caption,
                fontWeight: "700",
                color: theme.colors.accent.DEFAULT,
              }}
            >
              {item.sigla}
            </Text>
          </View>
          <Text className="flex-1 text-sm text-txt-secondary">
            <Text className="font-medium text-txt-primary">{item.nome}</Text>
            {" — "}
            {item.descricao}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function DicasSection({ categoria }: DicasSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const filteredDicas = filterDicas(categoria);
  const title = SECTION_TITLES[categoria];

  return (
    <Card className="p-0">
      <Pressable
        onPress={() => {
          animateNext();
          setExpanded((prev) => !prev);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${filteredDicas.length} dicas`}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name={categoria === "nutricao" ? "food-apple" : "dumbbell"}
            size={20}
            color={theme.colors.accent.DEFAULT}
          />
          <Text style={theme.typography.callout}>
            {title}
          </Text>
          <Text style={theme.typography.caption}>
            ({filteredDicas.length})
          </Text>
        </View>

        <MaterialCommunityIcons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.colors.text.muted}
        />
      </Pressable>

      {expanded && (
        <View className="gap-2 px-4 pb-4">
          {categoria === "treino" && <SeriesLegend />}
          {filteredDicas.map((dica) => (
            <DicaItem key={dica.id} dica={dica} />
          ))}
        </View>
      )}
    </Card>
  );
}
