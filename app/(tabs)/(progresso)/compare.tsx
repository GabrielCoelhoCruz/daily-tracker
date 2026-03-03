import { useState, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/constants/theme";
import {
  usePhysiqueStore,
  type PhysiqueCheckIn,
} from "@/stores/usePhysiqueStore";
import { Card } from "@/components/ui/Card";

const ANGLES = ["Frontal", "Lateral", "Costas"] as const;
type Angle = (typeof ANGLES)[number];

const screenWidth = Dimensions.get("window").width;
const photoWidth = (screenWidth - 48 - 12) / 2; // padding + gap

function WeekPicker({
  label,
  selected,
  options,
  onSelect,
}: {
  label: string;
  selected: string | null;
  options: PhysiqueCheckIn[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedCheckIn = options.find((c) => c.id === selected);

  return (
    <View style={{ flex: 1 }}>
      <Text style={[theme.typography.caption, { marginBottom: 4 }]}>
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(!open)}
        style={{
          backgroundColor: theme.colors.bg.elevated,
          borderRadius: theme.radius.md,
          padding: 10,
          minHeight: 44,
          justifyContent: "center",
        }}
        accessibilityRole="button"
        accessibilityLabel={`Selecionar ${label}`}
      >
        <Text style={theme.typography.body}>
          {selectedCheckIn
            ? `Semana ${selectedCheckIn.week}`
            : "Selecionar..."}
        </Text>
      </Pressable>
      {open && (
        <View
          style={{
            backgroundColor: theme.colors.bg.elevated,
            borderRadius: theme.radius.md,
            marginTop: 4,
            overflow: "hidden",
          }}
        >
          {options.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => {
                onSelect(c.id);
                setOpen(false);
              }}
              style={{
                padding: 10,
                backgroundColor:
                  c.id === selected
                    ? theme.colors.bg.card
                    : theme.colors.bg.elevated,
                minHeight: 44,
                justifyContent: "center",
              }}
              accessibilityRole="button"
            >
              <Text style={theme.typography.body}>
                Semana {c.week} — {c.weight}kg
              </Text>
              <Text style={theme.typography.caption}>{c.date}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function PhotoPair({
  checkInA,
  checkInB,
  angleIndex,
}: {
  checkInA: PhysiqueCheckIn;
  checkInB: PhysiqueCheckIn;
  angleIndex: number;
}) {
  const photoA = checkInA.photoPaths[angleIndex];
  const photoB = checkInB.photoPaths[angleIndex];

  return (
    <View className="flex-row" style={{ gap: 12 }}>
      <View style={{ flex: 1, alignItems: "center", gap: 6 }}>
        <Text style={theme.typography.caption}>Semana {checkInA.week}</Text>
        {photoA ? (
          <Image
            source={{ uri: photoA }}
            style={{
              width: photoWidth,
              height: photoWidth * 1.33,
              borderRadius: theme.radius.md,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: photoWidth,
              height: photoWidth * 1.33,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.bg.elevated,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={theme.typography.footnote}>Sem foto</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1, alignItems: "center", gap: 6 }}>
        <Text style={theme.typography.caption}>Semana {checkInB.week}</Text>
        {photoB ? (
          <Image
            source={{ uri: photoB }}
            style={{
              width: photoWidth,
              height: photoWidth * 1.33,
              borderRadius: theme.radius.md,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: photoWidth,
              height: photoWidth * 1.33,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.bg.elevated,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={theme.typography.footnote}>Sem foto</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function CompareScreen() {
  const checkIns = usePhysiqueStore((s) => s.checkIns);
  const sorted = useMemo(
    () => [...checkIns].sort((a, b) => a.week - b.week),
    [checkIns]
  );

  const [weekAId, setWeekAId] = useState<string | null>(
    sorted.length >= 2 ? sorted[sorted.length - 2].id : null
  );
  const [weekBId, setWeekBId] = useState<string | null>(
    sorted.length >= 1 ? sorted[sorted.length - 1].id : null
  );
  const [activeAngle, setActiveAngle] = useState<Angle>("Frontal");

  const checkInA = sorted.find((c) => c.id === weekAId);
  const checkInB = sorted.find((c) => c.id === weekBId);

  const angleIndex = ANGLES.indexOf(activeAngle);

  if (sorted.length < 2) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-primary"
      >
        <View className="items-center py-16 px-4" style={{ gap: 12 }}>
          <MaterialCommunityIcons
            name="compare"
            size={48}
            color={theme.colors.text.muted}
          />
          <Text style={theme.typography.callout}>
            Mínimo 2 check-ins necessários
          </Text>
          <Text
            style={[theme.typography.footnote, { textAlign: "center" }]}
          >
            Faça pelo menos 2 check-ins para comparar seu progresso visual
          </Text>
        </View>
      </ScrollView>
    );
  }

  const weightDelta =
    checkInA && checkInB ? checkInB.weight - checkInA.weight : null;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-primary"
    >
      <View className="p-4" style={{ gap: 12 }}>
        {/* Week selectors */}
        <View className="flex-row" style={{ gap: 12 }}>
          <WeekPicker
            label="Semana A"
            selected={weekAId}
            options={sorted}
            onSelect={setWeekAId}
          />
          <WeekPicker
            label="Semana B"
            selected={weekBId}
            options={sorted}
            onSelect={setWeekBId}
          />
        </View>

        {/* Weight delta header */}
        {checkInA && checkInB && (
          <Card className="p-0">
            <View
              className="flex-row items-center justify-center"
              style={{ padding: 12, gap: 8 }}
            >
              <Text style={theme.typography.body}>
                Semana {checkInA.week}: {checkInA.weight}kg
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color={theme.colors.text.muted}
              />
              <Text style={theme.typography.body}>
                Semana {checkInB.week}: {checkInB.weight}kg
              </Text>
              {weightDelta !== null && (
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color:
                      weightDelta > 0
                        ? theme.colors.semantic.error
                        : weightDelta < 0
                          ? theme.colors.semantic.success
                          : theme.colors.text.muted,
                  }}
                >
                  ({weightDelta > 0 ? "+" : ""}
                  {weightDelta.toFixed(1)}kg)
                </Text>
              )}
            </View>
          </Card>
        )}

        {/* Angle tabs */}
        <View className="flex-row" style={{ gap: 8 }}>
          {ANGLES.map((angle) => (
            <Pressable
              key={angle}
              onPress={() => setActiveAngle(angle)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: theme.radius.md,
                backgroundColor:
                  activeAngle === angle
                    ? theme.colors.accent.DEFAULT
                    : theme.colors.bg.elevated,
                alignItems: "center",
                minHeight: 44,
                justifyContent: "center",
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeAngle === angle }}
              accessibilityLabel={angle}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color:
                    activeAngle === angle ? "#000" : theme.colors.text.primary,
                }}
              >
                {angle}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Photo comparison */}
        {checkInA && checkInB && (
          <PhotoPair
            checkInA={checkInA}
            checkInB={checkInB}
            angleIndex={angleIndex}
          />
        )}
      </View>
    </ScrollView>
  );
}
