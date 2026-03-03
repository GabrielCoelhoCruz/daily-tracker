import { useState, useMemo } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import { useAthleteStore } from "@/stores/useAthleteStore";
import {
  findCategories,
  MALE_CATEGORIES,
  FEMALE_CATEGORIES,
  type CategoryResult,
  type CategoryMetadata,
} from "@/services/categoryFinder";
import { Card } from "@/components/ui/Card";

const STATUS_COLORS: Record<string, string> = {
  "✅": theme.colors.semantic.success,
  "⚠️": theme.colors.semantic.warning,
  "❌": theme.colors.semantic.error,
};

const STATUS_ORDER: Record<string, number> = { "✅": 0, "⚠️": 1, "❌": 2 };

function getMetadata(
  name: string,
  gender: "male" | "female"
): CategoryMetadata | undefined {
  const list = gender === "male" ? MALE_CATEGORIES : FEMALE_CATEGORIES;
  return list.find((c) => c.name === name);
}

function CategoryCard({
  result,
  gender,
}: {
  result: CategoryResult;
  gender: "male" | "female";
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = getMetadata(result.name, gender);
  const statusColor = STATUS_COLORS[result.status] ?? theme.colors.text.muted;

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel={`${result.name} ${result.statusText}`}
    >
      <Card className="p-0">
        <View style={{ padding: 12, gap: 8 }}>
          <View
            className="flex-row items-center justify-between"
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={theme.typography.callout}>{result.name}</Text>
              <Text style={theme.typography.footnote}>{result.className}</Text>
            </View>
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <View
                style={{
                  backgroundColor: statusColor + "20",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: theme.radius.sm,
                }}
              >
                <Text style={{ color: statusColor, fontSize: 13, fontWeight: "600" }}>
                  {result.status}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.colors.text.muted}
              />
            </View>
          </View>

          {result.deltaKg !== null && (
            <Text style={[theme.typography.footnote, { color: statusColor }]}>
              {result.statusText}
            </Text>
          )}

          {expanded && meta && (
            <View style={{ gap: 10, marginTop: 4 }}>
              <DetailRow label="Traje" value={meta.attire} />
              <DetailSection label="Poses obrigatórias" items={meta.poses} />
              <DetailSection
                label="Top 5 critérios de julgamento"
                items={meta.judgingCriteria.slice(0, 5)}
              />
              <DetailRow label="Musculatura" value={meta.musculatureLevel} />
              <DetailRow label="Condicionamento" value={meta.conditioningLevel} />
              <View
                style={{
                  backgroundColor: theme.colors.bg.elevated,
                  padding: 10,
                  borderRadius: theme.radius.md,
                }}
              >
                <Text style={[theme.typography.footnote, { fontStyle: "italic" }]}>
                  {meta.summary}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={[theme.typography.caption, { fontWeight: "600" }]}>{label}</Text>
      <Text style={theme.typography.footnote}>{value}</Text>
    </View>
  );
}

function DetailSection({ label, items }: { label: string; items: string[] }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={[theme.typography.caption, { fontWeight: "600" }]}>{label}</Text>
      {items.map((item, i) => (
        <Text key={i} style={theme.typography.footnote}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

export default function CategoriesScreen() {
  const gender = useAthleteStore((s) => s.gender);
  const heightCm = useAthleteStore((s) => s.heightCm);
  const currentWeightKg = useAthleteStore((s) => s.currentWeightKg);

  const results = useMemo(() => {
    if (!gender || !heightCm || !currentWeightKg) return [];
    return findCategories({ gender, heightCm, currentWeightKg });
  }, [gender, heightCm, currentWeightKg]);

  const sorted = useMemo(
    () =>
      [...results].sort(
        (a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3)
      ),
    [results]
  );

  const mostAccessible = sorted.find((r) => r.status === "✅");
  const evolution = sorted.find(
    (r) => r.status === "⚠️" || (r.status === "❌" && r.deltaKg !== null)
  );

  if (!gender || !heightCm || !currentWeightKg) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-primary"
      >
        <View className="items-center py-16 px-4" style={{ gap: 12 }}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={theme.colors.text.muted}
          />
          <Text style={theme.typography.callout}>Perfil incompleto</Text>
          <Text style={[theme.typography.footnote, { textAlign: "center" }]}>
            Preencha seu perfil com altura e peso para ver suas categorias
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-primary"
    >
      <View className="p-4" style={{ gap: 12 }}>
        <View
          style={{
            backgroundColor: theme.colors.bg.elevated,
            padding: 12,
            borderRadius: theme.radius.lg,
            gap: 4,
          }}
        >
          <Text style={theme.typography.footnote}>
            {heightCm}cm • {currentWeightKg}kg •{" "}
            {gender === "male" ? "Masculino" : "Feminino"}
          </Text>
          <Text style={theme.typography.caption}>
            {sorted.filter((r) => r.status === "✅").length} categorias elegíveis
          </Text>
        </View>

        {sorted.map((result) => (
          <CategoryCard key={result.name} result={result} gender={gender} />
        ))}

        {(mostAccessible || evolution) && (
          <Card>
            <View style={{ gap: 10 }}>
              <Text style={theme.typography.callout}>Recomendação</Text>
              {mostAccessible && (
                <View style={{ gap: 2 }}>
                  <Text style={[theme.typography.caption, { fontWeight: "600" }]}>
                    Mais acessível agora:
                  </Text>
                  <Text
                    style={[
                      theme.typography.body,
                      { color: theme.colors.semantic.success },
                    ]}
                  >
                    {mostAccessible.name}
                  </Text>
                </View>
              )}
              {evolution && (
                <View style={{ gap: 2 }}>
                  <Text style={[theme.typography.caption, { fontWeight: "600" }]}>
                    Se quiser evoluir:
                  </Text>
                  <Text
                    style={[
                      theme.typography.body,
                      { color: theme.colors.accent.DEFAULT },
                    ]}
                  >
                    {evolution.name}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
