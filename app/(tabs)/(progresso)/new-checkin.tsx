import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Paths, Directory, File } from "expo-file-system";
import { theme } from "@/constants/theme";
import { usePhysiqueStore, PHOTO_LABELS } from "@/stores/usePhysiqueStore";
import { PhotoSlots } from "@/components/physique/PhotoSlots";
import { analyzePhysique } from "@/services/physiqueAnalysis";

type PhotoSlot = { uri: string; label: string } | null;

export default function NewCheckInScreen() {
  const checkIns = usePhysiqueStore((s) => s.checkIns);
  const addCheckIn = usePhysiqueStore((s) => s.addCheckIn);
  const updateAnalysis = usePhysiqueStore((s) => s.updateAnalysis);

  const lastWeek = checkIns.length > 0
    ? Math.max(...checkIns.map((c) => c.week))
    : 0;

  const [weight, setWeight] = useState("");
  const [week, setWeek] = useState(String(lastWeek + 1));
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<"full" | "quick">("full");
  const [photos, setPhotos] = useState<PhotoSlot[]>([null, null, null, null]);
  const [loading, setLoading] = useState(false);

  const visibleSlots = mode === "quick" ? 1 : 4;
  const photoCount = photos.slice(0, visibleSlots).filter(Boolean).length;
  const isValid =
    Number(weight) > 0 && Number(week) > 0 && photoCount >= 1;

  const handleAddPhoto = (index: number, uri: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = { uri, label: PHOTO_LABELS[index] };
      return next;
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);

    try {
      const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const dir = new Directory(Paths.document, "physique/");
      if (!dir.exists) {
        dir.create();
      }

      const savedPaths: string[] = [];
      for (let i = 0; i < visibleSlots; i++) {
        const photo = photos[i];
        if (photo) {
          const dest = new File(dir, `${fileId}-${i}.jpg`);
          const src = new File(photo.uri);
          src.copy(dest);
          savedPaths.push(dest.uri);
        }
      }

      // Detect comparative mode
      const weekNum = Number(week);
      const prevCheckIn = checkIns.find((c) => c.week === weekNum - 1);
      const effectiveMode: "full" | "comparative" | "quick" | "posing" =
        mode === "quick"
          ? "quick"
          : prevCheckIn
            ? "comparative"
            : "full";

      const store = usePhysiqueStore.getState();

      // Call AI analysis BEFORE saving to store
      const { analysis, scores } = await analyzePhysique(savedPaths, effectiveMode, {
        week: weekNum,
        weight: Number(weight),
        previousWeight: prevCheckIn?.weight,
        notes: notes || undefined,
        previousPhotoPaths: prevCheckIn?.photoPaths,
        targetCategory: store.lastCategory,
      });

      // Only save to store after successful API call
      const checkInId = addCheckIn({
        week: weekNum,
        date: new Date().toISOString().split("T")[0],
        weight: Number(weight),
        previousWeight: prevCheckIn?.weight,
        notes: notes || undefined,
        photoPaths: savedPaths,
        analysis,
        scores,
        mode: effectiveMode,
        targetCategory: usePhysiqueStore.getState().lastCategory,
      });

      router.replace({
        pathname: "./result" as any,
        params: { id: checkInId },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center" style={{ gap: 16 }}>
        <ActivityIndicator size="large" color={theme.colors.accent.DEFAULT} />
        <Text style={theme.typography.body}>Analisando suas fotos...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-primary"
      keyboardDismissMode="on-drag"
    >
      <View className="p-4" style={{ gap: 20 }}>
        {/* Mode selector */}
        <View className="flex-row" style={{ gap: 8 }}>
          {(["full", "quick"] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: theme.radius.lg,
                backgroundColor:
                  mode === m ? theme.colors.accent.DEFAULT : theme.colors.bg.elevated,
                alignItems: "center",
                minHeight: 44,
                justifyContent: "center",
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === m }}
            >
              <Text
                style={{
                  color: mode === m ? "#000" : theme.colors.text.primary,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {m === "full" ? "Análise Completa" : "Quick Check"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Weight */}
        <View style={{ gap: 6 }}>
          <Text style={theme.typography.footnote}>Peso (kg) *</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="83.5"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="decimal-pad"
            style={{
              backgroundColor: theme.colors.bg.elevated,
              color: theme.colors.text.primary,
              borderRadius: theme.radius.lg,
              padding: 14,
              fontSize: 16,
              minHeight: 44,
            }}
            accessibilityLabel="Peso em quilogramas"
          />
        </View>

        {/* Week */}
        <View style={{ gap: 6 }}>
          <Text style={theme.typography.footnote}>Semana de prep *</Text>
          <TextInput
            value={week}
            onChangeText={setWeek}
            placeholder="1"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="number-pad"
            style={{
              backgroundColor: theme.colors.bg.elevated,
              color: theme.colors.text.primary,
              borderRadius: theme.radius.lg,
              padding: 14,
              fontSize: 16,
              minHeight: 44,
            }}
            accessibilityLabel="Semana de preparação"
          />
        </View>

        {/* Notes */}
        <View style={{ gap: 6 }}>
          <Text style={theme.typography.footnote}>Observações</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Me sentindo flat, retenção aumentou..."
            placeholderTextColor={theme.colors.text.muted}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: theme.colors.bg.elevated,
              color: theme.colors.text.primary,
              borderRadius: theme.radius.lg,
              padding: 14,
              fontSize: 15,
              minHeight: 80,
              textAlignVertical: "top",
            }}
            accessibilityLabel="Observações opcionais"
          />
        </View>

        {/* Photos */}
        <View style={{ gap: 6 }}>
          <Text style={theme.typography.footnote}>Fotos *</Text>
          <PhotoSlots
            photos={photos}
            onAdd={handleAddPhoto}
            onRemove={handleRemovePhoto}
            visibleSlots={visibleSlots}
          />
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={!isValid}
          style={{
            backgroundColor: isValid
              ? theme.colors.accent.DEFAULT
              : theme.colors.bg.elevated,
            borderRadius: theme.radius.lg,
            paddingVertical: 16,
            alignItems: "center",
            minHeight: 44,
            opacity: isValid ? 1 : 0.5,
          }}
          accessibilityRole="button"
          accessibilityLabel="Enviar check-in"
        >
          <Text
            style={{
              color: isValid ? "#000" : theme.colors.text.muted,
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            Enviar Check-in
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
