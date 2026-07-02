import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { theme, withAlpha } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { AppIcon } from "@/components/ui/AppIcon";
import { parseCoachPlan } from "@/utils/planImportUtils";
import { useProtocolStore } from "@/stores/useProtocolStore";

type Step = "paste" | "preview";

export default function ImportProtocolScreen() {
  const setCustomPlano = useProtocolStore((s) => s.setCustomPlano);
  const [step, setStep] = useState<Step>("paste");
  const [rawText, setRawText] = useState("");
  const [planName, setPlanName] = useState("");

  const parsed = useMemo(
    () => (step === "preview" ? parseCoachPlan(rawText, planName) : null),
    [step, rawText, planName]
  );

  function handlePreview() {
    if (rawText.trim().length < 10) {
      Alert.alert(
        "Texto muito curto",
        "Cole o plano completo do coach (refeições, suplementos, metas)."
      );
      return;
    }
    setStep("preview");
  }

  function handleConfirm() {
    if (!parsed || parsed.plano.periodos.length === 0) return;
    setCustomPlano(parsed.plano, "coach_import");
    // Alert.alert com botões é no-op no react-native-web; sem este fallback o
    // fluxo de importação trava na web (o plano salva mas a tela não volta).
    if (Platform.OS === "web") {
      router.back();
      return;
    }
    Alert.alert(
      "Protocolo importado",
      "Seu protocolo foi atualizado com o plano do coach.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  }

  const totalItens =
    parsed?.plano.periodos.reduce((acc, p) => acc + p.itens.length, 0) ?? 0;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }}
    >
      {step === "paste" ? (
        <>
          <Card>
            <View style={{ gap: 12 }}>
              <Text style={theme.typography.headline}>
                Colar plano do coach
              </Text>
              <Text style={theme.typography.footnote}>
                Cole o texto do plano (WhatsApp, notas, e-mail). O ShapeIQ
                estrutura períodos, itens e metas automaticamente — tudo
                offline.
              </Text>
              <TextInput
                value={planName}
                onChangeText={setPlanName}
                placeholder="Nome do plano (opcional)"
                placeholderTextColor={theme.colors.text.muted}
                style={{
                  ...theme.typography.body,
                  backgroundColor: theme.colors.bg.elevated,
                  borderRadius: theme.radius.md,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              />
              <TextInput
                value={rawText}
                onChangeText={setRawText}
                multiline
                textAlignVertical="top"
                placeholder={
                  "Exemplo:\nJejum:\n- Cafeína 220mg\nRefeição 1:\n- Ovos inteiros - 3 unidades\nÁgua 4L · Cardio 90 min"
                }
                placeholderTextColor={theme.colors.text.muted}
                style={{
                  ...theme.typography.body,
                  backgroundColor: theme.colors.bg.elevated,
                  borderRadius: theme.radius.md,
                  padding: 12,
                  minHeight: 220,
                }}
                accessibilityLabel="Texto do plano do coach"
              />
            </View>
          </Card>

          <Pressable
            onPress={handlePreview}
            accessibilityRole="button"
            accessibilityLabel="Analisar plano colado"
            style={{
              backgroundColor: theme.colors.accent.DEFAULT,
              borderRadius: theme.radius.lg,
              minHeight: 56,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: theme.colors.primary.onContainer,
              }}
            >
              Analisar plano
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          {parsed && parsed.warnings.length > 0 && (
            <View
              style={{
                backgroundColor: withAlpha(theme.colors.semantic.warning, 0.1),
                borderColor: withAlpha(theme.colors.semantic.warning, 0.25),
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                padding: 12,
                gap: 4,
              }}
            >
              {parsed.warnings.map((w) => (
                <Text
                  key={w}
                  style={{
                    ...theme.typography.footnote,
                    color: theme.colors.semantic.warning,
                  }}
                >
                  {w}
                </Text>
              ))}
            </View>
          )}

          <Card>
            <View style={{ gap: 8 }}>
              <Text style={theme.typography.headline}>
                {parsed?.plano.nome}
              </Text>
              <Text style={theme.typography.dataMono}>
                {parsed?.plano.periodos.length ?? 0} períodos · {totalItens}{" "}
                itens · Água {parsed?.plano.metaHidratacao.aguaMl ?? 0} ml ·
                Cardio {parsed?.plano.metaCardioMin ?? 0} min
              </Text>
            </View>
          </Card>

          {parsed?.plano.periodos.map((periodo) => (
            <Card key={periodo.id}>
              <View style={{ gap: 8 }}>
                <Text style={theme.typography.overline}>{periodo.nome}</Text>
                {periodo.itens.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <Text style={{ ...theme.typography.body, flex: 1 }}>
                      {item.nome}
                    </Text>
                    {item.dosagem ? (
                      <Text style={theme.typography.dataMono}>
                        {item.dosagem}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </Card>
          ))}

          <Pressable
            onPress={handleConfirm}
            disabled={!parsed || parsed.plano.periodos.length === 0}
            accessibilityRole="button"
            accessibilityLabel="Confirmar e usar este protocolo"
            style={{
              backgroundColor:
                parsed && parsed.plano.periodos.length > 0
                  ? theme.colors.accent.DEFAULT
                  : theme.colors.bg.elevated,
              borderRadius: theme.radius.lg,
              minHeight: 56,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color:
                  parsed && parsed.plano.periodos.length > 0
                    ? theme.colors.primary.onContainer
                    : theme.colors.text.muted,
              }}
            >
              Usar este protocolo
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStep("paste")}
            accessibilityRole="button"
            accessibilityLabel="Voltar e editar texto"
            style={{
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
            }}
          >
            <AppIcon
              sf="chevron.left"
              mci="chevron-left"
              size={14}
              color={theme.colors.text.secondary}
            />
            <Text style={theme.typography.footnote}>Voltar e editar</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
