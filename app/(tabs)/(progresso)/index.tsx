import { ScrollView, View, Text, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { theme } from "@/constants/theme";
import { usePhysiqueStore, MODE_LABELS, type PhysiqueCheckIn } from "@/stores/usePhysiqueStore";
import { useAthleteStore } from "@/stores/useAthleteStore";
import { Card } from "@/components/ui/Card";
import { AppIcon } from "@/components/ui/AppIcon";
import { useTabContentBottomPadding } from "@/utils/useTabContentPadding";
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
  const profileComplete = useAthleteStore((s) => s.isProfileComplete)();
  const athleteName = useAthleteStore((s) => s.name);
  const bottomPadding = useTabContentBottomPadding();

  if (!profileComplete) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 64,
          paddingBottom: bottomPadding,
          gap: 12,
        }}
      >
          <AppIcon
            sf="person.crop.circle"
            mci="account-outline"
            size={48}
            color={theme.colors.text.muted}
          />
          <Text style={theme.typography.callout}>Configure seu perfil</Text>
          <Text
            style={[theme.typography.footnote, { textAlign: "center" }]}
          >
            Precisamos do seu perfil para personalizar categorias e análises
          </Text>
          <Pressable
            onPress={() => router.push("./profile" as any)}
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
            accessibilityLabel="Configurar perfil"
          >
            <Text style={{ color: "#000", fontWeight: "700", fontSize: 15 }}>
              Configurar Perfil
            </Text>
          </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 16,
        paddingBottom: bottomPadding,
        gap: 12,
      }}
    >
        <Pressable
          onPress={() => router.push("./profile" as any)}
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
        >
          <Card className="p-0">
            <View
              className="flex-row items-center justify-between"
              style={{ padding: 12 }}
            >
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <AppIcon
                  sf="person.crop.circle"
                  mci="account-circle-outline"
                  size={20}
                  color={theme.colors.accent.DEFAULT}
                />
                <Text style={theme.typography.body}>{athleteName}</Text>
              </View>
              <AppIcon
                sf="chevron.right"
                mci="chevron-right"
                size={16}
                color={theme.colors.text.muted}
              />
            </View>
          </Card>
        </Pressable>

        <Pressable
          onPress={() => router.push("./categories" as any)}
          accessibilityRole="button"
          accessibilityLabel="Category Finder"
        >
          <Card className="p-0">
            <View
              className="flex-row items-center justify-between"
              style={{ padding: 12 }}
            >
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <AppIcon
                  sf="magnifyingglass"
                  mci="magnify"
                  size={20}
                  color={theme.colors.accent.DEFAULT}
                />
                <Text style={theme.typography.body}>Category Finder</Text>
              </View>
              <AppIcon
                sf="chevron.right"
                mci="chevron-right"
                size={16}
                color={theme.colors.text.muted}
              />
            </View>
          </Card>
        </Pressable>

        {sorted.length === 0 ? (
          <View className="items-center py-16" style={{ gap: 12 }}>
            <AppIcon
              sf="chart.line.uptrend.xyaxis"
              mci="chart-timeline-variant-shimmer"
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
            <View className="flex-row" style={{ gap: 8 }}>
              <Pressable
                onPress={() => router.push("./new-checkin" as any)}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.accent.DEFAULT,
                  paddingVertical: 14,
                  borderRadius: theme.radius.lg,
                  alignItems: "center",
                  minHeight: 44,
                }}
                accessibilityRole="button"
                accessibilityLabel="Novo check-in"
              >
                <Text
                  style={{ color: "#000", fontWeight: "700", fontSize: 15 }}
                >
                  Novo Check-in
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("./compare" as any)}
                style={{
                  backgroundColor: theme.colors.bg.elevated,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: theme.radius.lg,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 44,
                }}
                accessibilityRole="button"
                accessibilityLabel="Comparar check-ins"
              >
                <AppIcon
                  sf="square.on.square"
                  mci="compare"
                  size={20}
                  color={theme.colors.text.primary}
                />
              </Pressable>
            </View>
            <EvolutionChart />
            {sorted.map((c) => (
              <CheckInCard key={c.id} checkIn={c} />
            ))}
          </>
        )}
    </ScrollView>
  );
}
