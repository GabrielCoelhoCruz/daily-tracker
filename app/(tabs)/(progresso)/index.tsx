import { ScrollView, View, Text, Pressable, Image } from "react-native";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import { usePhysiqueStore, MODE_LABELS, type PhysiqueCheckIn } from "@/stores/usePhysiqueStore";
import { Card } from "@/components/ui/Card";
import { WeightDelta } from "@/components/physique/WeightDelta";
import { EvolutionChart } from "@/components/physique/EvolutionChart";

function CheckInCard({ checkIn }: { checkIn: PhysiqueCheckIn }) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "./result" as any,
          params: { id: checkIn.id },
        })
      }
      accessibilityRole="button"
      accessibilityLabel={`Check-in semana ${checkIn.week}`}
    >
      <Card className="p-0">
        <View className="flex-row" style={{ gap: 12, padding: 12 }}>
          {checkIn.photoPaths[0] && (
            <Image
              source={{ uri: checkIn.photoPaths[0] }}
              style={{
                width: 56,
                height: 75,
                borderRadius: theme.radius.md,
              }}
            />
          )}
          <View style={{ flex: 1, gap: 4 }}>
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Text style={theme.typography.callout}>Semana {checkIn.week}</Text>
              <View
                style={{
                  backgroundColor: theme.colors.bg.elevated,
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: theme.radius.sm,
                }}
              >
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.accent.DEFAULT },
                  ]}
                >
                  {MODE_LABELS[checkIn.mode] ?? checkIn.mode}
                </Text>
              </View>
            </View>
            <Text style={theme.typography.footnote}>{checkIn.date}</Text>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <Text style={theme.typography.body}>{checkIn.weight}kg</Text>
              <WeightDelta
                weight={checkIn.weight}
                previousWeight={checkIn.previousWeight}
                fontSize={12}
              />
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function ProgressoScreen() {
  const checkIns = usePhysiqueStore((s) => s.checkIns);
  const sorted = [...checkIns].sort((a, b) => b.week - a.week);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-primary"
    >
      <View className="p-4" style={{ gap: 12 }}>
        {sorted.length === 0 ? (
          <View className="items-center py-16" style={{ gap: 12 }}>
            <MaterialCommunityIcons
              name="chart-timeline-variant-shimmer"
              size={48}
              color={theme.colors.text.muted}
            />
            <Text style={theme.typography.callout}>Nenhum check-in ainda</Text>
            <Text style={theme.typography.footnote}>
              Comece seu primeiro check-in de progresso
            </Text>
            <Pressable
              onPress={() => router.push("./new-checkin" as any)}
              style={{
                backgroundColor: theme.colors.accent.DEFAULT,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: theme.radius.lg,
                marginTop: 8,
                minHeight: 44,
                justifyContent: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel="Novo check-in"
            >
              <Text style={{ color: "#000", fontWeight: "700", fontSize: 15 }}>
                Novo Check-in
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable
              onPress={() => router.push("./new-checkin" as any)}
              style={{
                backgroundColor: theme.colors.accent.DEFAULT,
                paddingVertical: 14,
                borderRadius: theme.radius.lg,
                alignItems: "center",
                minHeight: 44,
              }}
              accessibilityRole="button"
              accessibilityLabel="Novo check-in"
            >
              <Text style={{ color: "#000", fontWeight: "700", fontSize: 15 }}>
                Novo Check-in
              </Text>
            </Pressable>
            <EvolutionChart />
            {sorted.map((c) => (
              <CheckInCard key={c.id} checkIn={c} />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
