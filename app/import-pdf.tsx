import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { theme, withAlpha } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { AppIcon } from "@/components/ui/AppIcon";
import {
  importPlanFromPdf,
  validatePickedFile,
  PDF_IMPORT_MESSAGES,
} from "@/services/planPdfImport";
import {
  aiPlanToPlano,
  normalizeCloseoutTime,
  type AiParsedPlan,
} from "@/utils/aiPlanImport";
import { understandPdfPlan } from "@/utils/pdfPlanUnderstanding";
import { useProtocolStore } from "@/stores/useProtocolStore";

type Step = "select" | "processing" | "review";

const PROCESSING_LABELS = [
  "Lendo arquivo…",
  "Extraindo texto…",
  "Organizando plano…",
  "Preparando revisão…",
];

function ConfidenceBadge({ confidence }: { confidence: "alta" | "média" | "baixa" }) {
  if (confidence !== "baixa") return null;
  return (
    <View
      style={{
        backgroundColor: withAlpha(theme.colors.semantic.warning, 0.15),
        borderRadius: theme.radius.sm,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          ...theme.typography.caption,
          color: theme.colors.semantic.warning,
        }}
      >
        Confiança baixa — revise
      </Text>
    </View>
  );
}

function SourceExcerpt({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <Text
      style={{
        ...theme.typography.caption,
        color: theme.colors.text.muted,
        fontStyle: "italic",
      }}
      numberOfLines={2}
    >
      “{text}”
    </Text>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={theme.typography.overline}>{title}</Text>;
}

function MetaField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          ...theme.typography.footnote,
          color: theme.colors.onSurface.variant,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.muted}
        style={{
          ...theme.typography.body,
          backgroundColor: theme.colors.bg.elevated,
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
        accessibilityLabel={label}
      />
    </View>
  );
}

export default function ImportPdfScreen() {
  const setCustomPlano = useProtocolStore((s) => s.setCustomPlano);
  const setCustomTreinos = useProtocolStore((s) => s.setCustomTreinos);
  const setPlanPrefs = useProtocolStore((s) => s.setPlanPrefs);

  const [step, setStep] = useState<Step>("select");
  const [processingIndex, setProcessingIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [parsed, setParsed] = useState<AiParsedPlan | null>(null);

  // Metadados editáveis na revisão (o usuário sempre revisa antes de ativar).
  const [waterMl, setWaterMl] = useState("");
  const [cardioMin, setCardioMin] = useState("");
  const [closeout, setCloseout] = useState("");
  const [split, setSplit] = useState("");
  const [planName, setPlanName] = useState("");

  const importingRef = useRef(false);
  const cancelledRef = useRef(false);
  useEffect(() => () => {
    cancelledRef.current = true;
  }, []);

  useEffect(() => {
    if (step !== "processing") return;
    setProcessingIndex(0);
    const timer = setInterval(() => {
      setProcessingIndex((i) => Math.min(i + 1, PROCESSING_LABELS.length - 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [step]);

  function enterReview(result: AiParsedPlan) {
    setParsed(result);
    setWaterMl(result.waterTargetMl != null ? String(result.waterTargetMl) : "");
    setCardioMin(result.cardioTargetMin != null ? String(result.cardioTargetMin) : "");
    setCloseout(result.closeoutTime ?? "");
    setSplit(result.trainingSplit ?? "");
    setPlanName(result.title ?? "");
    setStep("review");
  }

  async function handlePickPdf() {
    // Evita importações duplicadas em voo (toque duplo, re-render do dev).
    if (importingRef.current) return;
    importingRef.current = true;
    try {
      setErrorMessage(null);
      setFallbackText(null);
      const picked = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled || !picked.assets?.[0]) return;

      const asset = picked.assets[0];
      const validationError = validatePickedFile({
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size,
      });
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      setStep("processing");
      const outcome = await importPlanFromPdf(asset.uri);
      if (cancelledRef.current) return;

      if (outcome.status === "ok") {
        setProcessingIndex(PROCESSING_LABELS.length - 1);
        enterReview(outcome.result);
        return;
      }

      setErrorMessage(outcome.userMessage);
      setFallbackText(outcome.extractedText ?? null);
      setStep("select");
    } finally {
      importingRef.current = false;
    }
  }

  /** IA falhou mas o texto foi extraído: organiza offline com o parser. */
  function handleOfflineFallback() {
    if (!fallbackText) return;
    const result = understandPdfPlan(fallbackText).parsedPlan;
    if (result.mealPeriods.length === 0 && result.trainingPlan === null) {
      setErrorMessage(PDF_IMPORT_MESSAGES.unreadable);
      return;
    }
    enterReview(result);
  }

  function updateItemTitle(periodIndex: number, itemIndex: number, title: string) {
    setParsed((prev) => {
      if (!prev) return prev;
      const mealPeriods = prev.mealPeriods.map((p, pi) =>
        pi === periodIndex
          ? {
              ...p,
              items: p.items.map((it, ii) =>
                ii === itemIndex ? { ...it, title } : it,
              ),
            }
          : p,
      );
      return { ...prev, mealPeriods };
    });
  }

  function updateItemQuantity(periodIndex: number, itemIndex: number, quantity: string) {
    setParsed((prev) => {
      if (!prev) return prev;
      const mealPeriods = prev.mealPeriods.map((p, pi) =>
        pi === periodIndex
          ? {
              ...p,
              items: p.items.map((it, ii) =>
                ii === itemIndex ? { ...it, quantity: quantity || null } : it,
              ),
            }
          : p,
      );
      return { ...prev, mealPeriods };
    });
  }

  function removeItem(periodIndex: number, itemIndex: number) {
    setParsed((prev) => {
      if (!prev) return prev;
      const mealPeriods = prev.mealPeriods.map((p, pi) =>
        pi === periodIndex
          ? { ...p, items: p.items.filter((_, ii) => ii !== itemIndex) }
          : p,
      );
      return { ...prev, mealPeriods };
    });
  }

  function handleActivate() {
    if (!parsed) return;
    const edited: AiParsedPlan = {
      ...parsed,
      waterTargetMl: Number(waterMl) > 0 ? Math.round(Number(waterMl)) : parsed.waterTargetMl,
      cardioTargetMin: Number(cardioMin) >= 0 && cardioMin.trim() !== "" ? Math.round(Number(cardioMin)) : parsed.cardioTargetMin,
      closeoutTime: normalizeCloseoutTime(closeout) ?? parsed.closeoutTime,
      trainingSplit: split.trim() ? split.trim().toUpperCase() : parsed.trainingSplit,
    };
    const { plano, closeoutTime, treinos } = aiPlanToPlano(edited, planName || undefined);
    if (plano.periodos.length === 0) {
      Alert.alert(
        "Plano vazio",
        "Nenhuma refeição ou suplemento para ativar. Edite os itens ou use outro método de import.",
      );
      return;
    }
    setCustomPlano(plano, "coach_import");
    setCustomTreinos(treinos ?? null);
    if (closeoutTime) {
      setPlanPrefs({ closeoutTime });
    }
    // Alert com botões é no-op no react-native-web (mesmo fallback do paste).
    if (Platform.OS === "web") {
      router.back();
      return;
    }
    Alert.alert(
      "Protocolo importado",
      "Seu protocolo foi atualizado com o plano do coach. Revise as metas na próxima etapa.",
      [{ text: "OK", onPress: () => router.back() }],
    );
  }

  const totalItems =
    parsed?.mealPeriods.reduce((acc, p) => acc + p.items.length, 0) ?? 0;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }}
    >
      {step === "select" && (
        <>
          <Card>
            <View style={{ gap: 12 }}>
              <Text style={theme.typography.headline}>
                Importar PDF do plano
              </Text>
              <Text style={theme.typography.footnote}>
                Escolha o arquivo PDF que contém seu plano. Vamos tentar
                organizar refeições, treino, água, cardio e observações.
              </Text>
              <Text style={theme.typography.caption}>
                O arquivo é usado para organizar o plano e revisar antes de
                ativar. Evite enviar documentos que não queira processar no
                app.
              </Text>
            </View>
          </Card>

          {errorMessage && (
            <View
              style={{
                backgroundColor: withAlpha(theme.colors.semantic.warning, 0.1),
                borderColor: withAlpha(theme.colors.semantic.warning, 0.25),
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                padding: 12,
                gap: 8,
              }}
            >
              <Text
                style={{
                  ...theme.typography.footnote,
                  color: theme.colors.semantic.warning,
                }}
              >
                {errorMessage}
              </Text>
              {fallbackText ? (
                <Pressable
                  onPress={handleOfflineFallback}
                  accessibilityRole="button"
                  accessibilityLabel="Organizar sem IA com o texto extraído"
                  style={{ minHeight: 44, justifyContent: "center" }}
                >
                  <Text
                    style={{
                      ...theme.typography.callout,
                      color: theme.colors.accent.DEFAULT,
                    }}
                  >
                    Organizar sem IA (texto já extraído) →
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )}

          <Pressable
            onPress={handlePickPdf}
            accessibilityRole="button"
            accessibilityLabel="Escolher PDF"
            testID="pick-pdf-cta"
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
              Escolher PDF
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/import-protocol")}
            accessibilityRole="button"
            accessibilityLabel="Colar texto do plano"
            style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={theme.typography.footnote}>
              Prefere colar o texto? Usar “Colar texto”
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={{
              minHeight: 44,
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
            <Text style={theme.typography.footnote}>Voltar</Text>
          </Pressable>
        </>
      )}

      {step === "processing" && (
        <View
          style={{
            gap: 16,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 80,
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.accent.DEFAULT} />
          <Text style={theme.typography.headline}>
            {PROCESSING_LABELS[processingIndex]}
          </Text>
          <Text style={theme.typography.caption}>
            A IA organiza o plano que você já recebeu. Nada é ativado sem a
            sua revisão.
          </Text>
          <Pressable
            onPress={() => {
              cancelledRef.current = true;
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel="Cancelar importação"
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text
              style={{
                ...theme.typography.footnote,
                color: theme.colors.text.secondary,
              }}
            >
              Cancelar
            </Text>
          </Pressable>
        </View>
      )}

      {step === "review" && parsed && (
        <>
          <Card>
            <View style={{ gap: 8 }}>
              <Text style={theme.typography.headline}>
                Revise o plano importado
              </Text>
              <Text style={theme.typography.footnote}>
                {parsed.source === "paste_parser"
                  ? "Organizamos o texto extraído do PDF sem IA. Revise antes de ativar."
                  : "A IA organizou o conteúdo do PDF. Revise antes de ativar."}
              </Text>
              <Text style={theme.typography.dataMono}>
                {parsed.mealPeriods.length} períodos · {totalItems} itens
                {parsed.waterTargetMl != null ? ` · Água ${parsed.waterTargetMl} ml` : ""}
                {parsed.cardioTargetMin != null
                  ? ` · Cardio ${parsed.cardioTargetMin} min${parsed.cardioTargetType === "weekly" ? "/semana" : parsed.cardioTargetType === "daily" ? "/dia" : ""}`
                  : ""}
                {parsed.trainingSplit ? ` · Treino ${parsed.trainingSplit}` : ""}
                {parsed.closeoutTime ? ` · Fechamento ${parsed.closeoutTime}` : ""}
              </Text>
              <Text style={theme.typography.caption}>
                Confiança geral: {parsed.confidence}
              </Text>
              <ConfidenceBadge confidence={parsed.confidence} />
              {parsed.summary ? (
                <Text style={theme.typography.footnote}>{parsed.summary}</Text>
              ) : null}
            </View>
          </Card>

          <MetaField
            label="Nome do plano"
            value={planName}
            onChangeText={setPlanName}
            placeholder="Plano do coach"
          />

          {/* Refeições */}
          <SectionTitle title="Refeições" />
          {parsed.mealPeriods.map((period, pIndex) => (
            <Card key={`${period.name}-${pIndex}`}>
              <View style={{ gap: 10 }}>
                <Text style={theme.typography.overline}>
                  {period.name}
                  {period.timeWindow ? ` · ${period.timeWindow}` : ""}
                </Text>
                <ConfidenceBadge confidence={period.confidence} />
                <SourceExcerpt text={period.sourceText} />
                {period.items.map((item, iIndex) => (
                  <View
                    key={iIndex}
                    style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
                  >
                    <TextInput
                      value={item.title}
                      onChangeText={(t) => updateItemTitle(pIndex, iIndex, t)}
                      style={{
                        ...theme.typography.body,
                        flex: 1,
                        backgroundColor: theme.colors.bg.elevated,
                        borderRadius: theme.radius.md,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                      }}
                      accessibilityLabel={`Editar item ${item.title}`}
                    />
                    <TextInput
                      value={[item.quantity, item.unit].filter(Boolean).join(" ")}
                      onChangeText={(t) => updateItemQuantity(pIndex, iIndex, t)}
                      placeholder="Qtd."
                      placeholderTextColor={theme.colors.text.muted}
                      style={{
                        ...theme.typography.dataMono,
                        width: 90,
                        backgroundColor: theme.colors.bg.elevated,
                        borderRadius: theme.radius.md,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                      }}
                      accessibilityLabel={`Editar quantidade de ${item.title}`}
                    />
                    <Pressable
                      onPress={() => removeItem(pIndex, iIndex)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ${item.title}`}
                      style={{ minHeight: 44, minWidth: 32, alignItems: "center", justifyContent: "center" }}
                    >
                      <AppIcon
                        sf="xmark.circle"
                        mci="close-circle-outline"
                        size={18}
                        color={theme.colors.text.muted}
                      />
                    </Pressable>
                  </View>
                ))}
                {period.items.some((i) => i.confidence === "baixa") ? (
                  <ConfidenceBadge confidence="baixa" />
                ) : null}
              </View>
            </Card>
          ))}

          {/* Água · Cardio · Treino · Fechamento */}
          <SectionTitle title="Água · Cardio · Treino · Fechamento" />
          <Card>
            <View style={{ gap: 12 }}>
              <MetaField
                label="Água (ml)"
                value={waterMl}
                onChangeText={setWaterMl}
                placeholder="3000"
              />
              <MetaField
                label="Cardio (min)"
                value={cardioMin}
                onChangeText={setCardioMin}
                placeholder="30"
              />
              {parsed.cardioTargetMin != null && parsed.cardioTargetType === null ? (
                <Text
                  style={{
                    ...theme.typography.caption,
                    color: theme.colors.semantic.warning,
                  }}
                >
                  Não ficou claro se o cardio é diário ou semanal. Confirme na
                  etapa de metas.
                </Text>
              ) : null}
              <MetaField
                label="Treino (split, ex.: ABCDE)"
                value={split}
                onChangeText={setSplit}
                placeholder="ABCDE"
              />
              <MetaField
                label="Fechamento do dia (hh:mm)"
                value={closeout}
                onChangeText={setCloseout}
                placeholder="21:00"
              />
            </View>
          </Card>

          {/* Treino detalhado */}
          {parsed.trainingPlan && parsed.trainingPlan.groups.length > 0 && (
            <>
              <SectionTitle title="Treino importado" />
              <Card>
                <View style={{ gap: 12 }}>
                  <Text style={theme.typography.footnote}>
                    O treino abaixo será usado na aba Treino após ativar o plano.
                  </Text>
                  {parsed.trainingPlan.groups.map((group) => (
                    <View key={group.code} style={{ gap: 4 }}>
                      <Text style={theme.typography.body}>
                        Treino {group.code} · {group.label}
                      </Text>
                      <Text style={theme.typography.caption}>
                        {group.exercises.length} exercícios
                      </Text>
                      {group.exercises.slice(0, 3).map((exercise) => (
                        <Text key={exercise.name} style={theme.typography.caption}>
                          {exercise.name}
                          {exercise.rawPrescription ? ` · ${exercise.rawPrescription}` : ""}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </Card>
            </>
          )}

          {parsed.trainingPlan && parsed.trainingPlan.guidance.length > 0 && (
            <>
              <SectionTitle title="Orientações de treino" />
              <Card>
                <View style={{ gap: 8 }}>
                  {parsed.trainingPlan.guidance.slice(0, 6).map((text, i) => (
                    <Text key={i} style={theme.typography.footnote}>
                      {text}
                    </Text>
                  ))}
                </View>
              </Card>
            </>
          )}

          {parsed.trainingDays.length > 0 && (
            <>
              <SectionTitle title="Treino" />
              <Card>
                <View style={{ gap: 8 }}>
                  {parsed.trainingDays.map((day, i) => (
                    <View key={i} style={{ gap: 2 }}>
                      <Text style={theme.typography.body}>
                        {[day.weekday, day.label].filter(Boolean).join(" — ") ||
                          "Dia de treino"}
                      </Text>
                      {day.muscleGroups.length > 0 ? (
                        <Text style={theme.typography.caption}>
                          {day.muscleGroups.join(", ")}
                        </Text>
                      ) : null}
                      <ConfidenceBadge confidence={day.confidence} />
                    </View>
                  ))}
                  <Text style={theme.typography.caption}>
                    Os dias de treino podem ser ajustados depois na aba Treino.
                  </Text>
                </View>
              </Card>
            </>
          )}

          {/* Suplementos */}
          {parsed.supplements.length > 0 && (
            <>
              <SectionTitle title="Suplementos" />
              <Card>
                <View style={{ gap: 8 }}>
                  {parsed.supplements.map((s, i) => (
                    <View
                      key={i}
                      style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}
                    >
                      <Text style={{ ...theme.typography.body, flex: 1 }}>
                        {s.title}
                        {s.timing ? ` (${s.timing})` : ""}
                      </Text>
                      {s.dosage ? (
                        <Text style={theme.typography.dataMono}>{s.dosage}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </Card>
            </>
          )}

          {/* Observações */}
          {parsed.coachTips.length > 0 && (
            <>
              <SectionTitle title="Dicas do coach" />
              <Card>
                <View style={{ gap: 8 }}>
                  {parsed.coachTips.map((text, i) => (
                    <Text key={i} style={theme.typography.footnote}>
                      {text}
                    </Text>
                  ))}
                </View>
              </Card>
            </>
          )}

          {parsed.observations.length > 0 && (
            <>
              <SectionTitle title="Observações" />
              <Card>
                <View style={{ gap: 8 }}>
                  {parsed.observations.map((o, i) => (
                    <View key={i} style={{ gap: 2 }}>
                      <Text style={theme.typography.footnote}>{o.text}</Text>
                      <ConfidenceBadge confidence={o.confidence} />
                    </View>
                  ))}
                </View>
              </Card>
            </>
          )}

          {/* Itens sensíveis */}
          {parsed.sensitiveItems.length > 0 && (
            <>
              <SectionTitle title="Itens sensíveis" />
              <View
                style={{
                  backgroundColor: withAlpha(theme.colors.semantic.warning, 0.08),
                  borderColor: withAlpha(theme.colors.semantic.warning, 0.25),
                  borderWidth: 1,
                  borderRadius: theme.radius.lg,
                  padding: 12,
                  gap: 8,
                }}
              >
                <Text style={theme.typography.footnote}>
                  Algumas instruções parecem envolver medicação, hormônios,
                  diuréticos ou manipulação de água/sódio. O ShapeIQ não
                  transforma isso em checklist. Revise diretamente com seu
                  profissional.
                </Text>
                {parsed.sensitiveItems.map((s, i) => (
                  <View key={i} style={{ gap: 2 }}>
                    <Text style={theme.typography.body}>{s.text}</Text>
                    <Text
                      style={{
                        ...theme.typography.caption,
                        color: theme.colors.semantic.warning,
                      }}
                    >
                      {s.category}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Não mapeado */}
          {parsed.unmapped.length > 0 && (
            <>
              <SectionTitle title="Não mapeado" />
              <Card>
                <View style={{ gap: 8 }}>
                  <Text style={theme.typography.footnote}>
                    Essas linhas não foram classificadas com segurança. Você
                    pode ignorar, editar ou transformar manualmente em item do
                    plano.
                  </Text>
                  {parsed.unmapped.map((u, i) => (
                    <View key={i} style={{ gap: 2 }}>
                      <Text style={theme.typography.body}>{u.text}</Text>
                      {u.reason ? (
                        <Text style={theme.typography.caption}>{u.reason}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </Card>
            </>
          )}

          <Pressable
            onPress={handleActivate}
            accessibilityRole="button"
            accessibilityLabel="Ativar plano importado"
            testID="activate-pdf-plan-cta"
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
              Ativar plano
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/import-protocol")}
            accessibilityRole="button"
            accessibilityLabel="Editar manualmente colando o texto"
            style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={theme.typography.footnote}>Editar manualmente</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setParsed(null);
              setStep("select");
            }}
            accessibilityRole="button"
            accessibilityLabel="Escolher outro PDF"
            style={{
              minHeight: 44,
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
            <Text style={theme.typography.footnote}>Escolher outro PDF</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
