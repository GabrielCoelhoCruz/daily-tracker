import { ScrollView, View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";
import { Card } from "@/components/ui/Card";

type GuideSection = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  items: string[];
};

const SECTIONS: GuideSection[] = [
  {
    icon: "time-outline",
    title: "Quando tirar",
    items: [
      "De manhã, em jejum",
      "Antes do treino (sem pump)",
      "Mesmo horário toda semana",
    ],
  },
  {
    icon: "location-outline",
    title: "Onde tirar",
    items: [
      "Mesmo local toda semana",
      "Fundo neutro (parede lisa)",
      "Câmera na altura da cintura",
      "Use timer — não segure o celular",
    ],
  },
  {
    icon: "sunny-outline",
    title: "Iluminação",
    items: [
      "Luz lateral a 45° (consistência > estética)",
      "Evite luz direta de cima",
      "Mesmo setup de luz toda semana",
    ],
  },
  {
    icon: "camera-outline",
    title: "Fotos obrigatórias (3)",
    items: ["Frontal relaxado", "Lateral relaxado", "Costas relaxado"],
  },
  {
    icon: "trophy-outline",
    title: "Fotos opcionais",
    items: [
      "Poses da categoria a cada 2-3 semanas",
      "Use o modo Posing no check-in",
    ],
  },
  {
    icon: "shirt-outline",
    title: "Regras",
    items: [
      "Mesma roupa/cor entre semanas",
      "Não segure o celular (use timer ou tripé)",
      "Consistência > perfeição",
    ],
  },
];

export default function PhotoGuideScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-primary"
    >
      <View className="p-4" style={{ gap: 12 }}>
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.text.muted },
          ]}
        >
          Fotos consistentes = análises mais precisas. Siga estas dicas para
          tirar o máximo do seu check-in.
        </Text>

        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <View className="flex-row items-center" style={{ gap: 10, marginBottom: 10 }}>
              <Ionicons
                name={section.icon}
                size={22}
                color={theme.colors.accent.DEFAULT}
              />
              <Text
                style={[
                  theme.typography.callout,
                  { color: theme.colors.text.primary, fontWeight: "600" },
                ]}
              >
                {section.title}
              </Text>
            </View>
            <View style={{ gap: 6 }}>
              {section.items.map((item) => (
                <View key={item} className="flex-row" style={{ gap: 8 }}>
                  <Text style={{ color: theme.colors.accent.DEFAULT, fontSize: 14 }}>
                    •
                  </Text>
                  <Text
                    style={[
                      theme.typography.footnote,
                      { color: theme.colors.text.secondary, flex: 1 },
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
