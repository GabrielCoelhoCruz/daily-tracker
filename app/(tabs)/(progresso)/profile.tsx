import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { theme } from "@/constants/theme";
import { useAthleteStore, type Gender } from "@/stores/useAthleteStore";
import { Card } from "@/components/ui/Card";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
];

function validate(fields: {
  name: string;
  gender: string;
  heightCm: string;
  weightKg: string;
}): string | null {
  if (!fields.name.trim()) return "Nome é obrigatório";
  if (fields.gender !== "male" && fields.gender !== "female")
    return "Selecione o sexo";
  const h = Number(fields.heightCm);
  if (!h || h < 140 || h > 220) return "Altura deve ser entre 140 e 220 cm";
  const w = Number(fields.weightKg);
  if (!w || w < 40 || w > 180) return "Peso deve ser entre 40 e 180 kg";
  return null;
}

export default function ProfileScreen() {
  const store = useAthleteStore();

  const [name, setName] = useState(store.name);
  const [gender, setGender] = useState<Gender | "">(store.gender);
  const [heightCm, setHeightCm] = useState(
    store.heightCm ? String(store.heightCm) : ""
  );
  const [weightKg, setWeightKg] = useState(
    store.currentWeightKg ? String(store.currentWeightKg) : ""
  );
  const [phase, setPhase] = useState(store.phase);
  const [coachName, setCoachName] = useState(store.coachName);
  const [experience, setExperience] = useState(store.competitiveExperience);

  function handleSave() {
    const error = validate({ name, gender, heightCm, weightKg });
    if (error) {
      Alert.alert("Erro", error);
      return;
    }
    store.updateProfile({
      name: name.trim(),
      gender: gender as Gender,
      heightCm: Number(heightCm),
      currentWeightKg: Number(weightKg),
      phase: phase.trim(),
      coachName: coachName.trim(),
      competitiveExperience: experience.trim(),
    });
    router.back();
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      className="flex-1 bg-primary"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-4" style={{ gap: 12 }}>
        <Card>
          <View style={{ gap: 16 }}>
            <Text style={[theme.typography.headline, { marginBottom: 4 }]}>
              Perfil do Atleta
            </Text>

            <Field label="Nome *" value={name} onChangeText={setName} />

            <View style={{ gap: 6 }}>
              <Text style={theme.typography.footnote}>Sexo *</Text>
              <View className="flex-row" style={{ gap: 8 }}>
                {GENDER_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setGender(opt.value)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: theme.radius.md,
                      borderWidth: 1,
                      borderColor:
                        gender === opt.value
                          ? theme.colors.accent.DEFAULT
                          : theme.colors.bg.elevated,
                      backgroundColor:
                        gender === opt.value
                          ? theme.colors.accent.DEFAULT + "20"
                          : theme.colors.bg.elevated,
                      alignItems: "center",
                      minHeight: 44,
                      justifyContent: "center",
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={opt.label}
                  >
                    <Text
                      style={[
                        theme.typography.body,
                        gender === opt.value && {
                          color: theme.colors.accent.DEFAULT,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Field
              label="Altura (cm) *"
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
              placeholder="172"
            />

            <Field
              label="Peso atual (kg) *"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="numeric"
              placeholder="85"
            />

            <Field
              label="Fase (opcional)"
              value={phase}
              onChangeText={setPhase}
              placeholder="Ex: Cutting, Bulking, Off-season"
            />

            <Field
              label="Coach (opcional)"
              value={coachName}
              onChangeText={setCoachName}
              placeholder="Nome do coach"
            />

            <Field
              label="Experiência competitiva (opcional)"
              value={experience}
              onChangeText={setExperience}
              placeholder="Ex: Iniciante, 2 competições"
            />
          </View>
        </Card>

        <Pressable
          onPress={handleSave}
          style={{
            backgroundColor: theme.colors.accent.DEFAULT,
            paddingVertical: 14,
            borderRadius: theme.radius.lg,
            alignItems: "center",
            minHeight: 44,
          }}
          accessibilityRole="button"
          accessibilityLabel="Salvar perfil"
        >
          <Text style={{ color: "#000", fontWeight: "700", fontSize: 15 }}>
            Salvar
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "numeric" | "default";
  placeholder?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={theme.typography.footnote}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.muted}
        style={{
          backgroundColor: theme.colors.bg.elevated,
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: theme.colors.text.primary,
          fontSize: 15,
          minHeight: 44,
        }}
      />
    </View>
  );
}
