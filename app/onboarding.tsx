import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme, withAlpha } from "@/constants/theme";
import { AppIcon } from "@/components/ui/AppIcon";
import {
  useAthleteStore,
  OBJECTIVE_LABELS,
  EXPERIENCE_LABELS,
  type CheckInMode,
  type ExperienceLevel,
  type Gender,
  type Objective,
} from "@/stores/useAthleteStore";
import { useProtocolStore, type PlanOrigin } from "@/stores/useProtocolStore";
import { useSplitStore } from "@/stores/useSplitStore";
import {
  SPLIT_ASSIGNMENT_OPTIONS,
  WEEK_DAY_ORDER,
  areWeekDaySlotsEqual,
  formatWeekDaySlotShort,
  getWeekDaySlot,
  type SplitWeekPlan,
  type WeekDaySlot,
} from "@/utils/splitWeekUtils";
import { buildBasePlan, suggestMealNames } from "@/utils/basePlanUtils";
import { seedDemoData } from "@/utils/demoSeedUtils";

const SHARED_STEPS = ["path", "objetivo", "perfil", "checkins"] as const;
const COACH_STEPS = ["coach", "protocolo", "metas", "pronto"] as const;
// "Tenho coach → Começar simples" usa o mesmo construtor de plano-base,
// preservando o caminho/origem do coach.
const COACH_SIMPLE_STEPS = [
  "coach",
  "protocolo",
  "metasBase",
  "refeicoes",
  "treinoSemana",
  "refeicaoLivre",
  "revisao",
  "pronto",
] as const;
const MANUAL_STEPS = [
  "metasBase",
  "refeicoes",
  "treinoSemana",
  "refeicaoLivre",
  "revisao",
  "pronto",
] as const;

type StepName =
  | (typeof SHARED_STEPS)[number]
  | (typeof COACH_STEPS)[number]
  | (typeof MANUAL_STEPS)[number];

const OBJECTIVE_OPTIONS = Object.entries(OBJECTIVE_LABELS) as [
  Objective,
  string,
][];
const EXPERIENCE_OPTIONS = Object.entries(EXPERIENCE_LABELS) as [
  ExperienceLevel,
  string,
][];

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
  0: "Domingo",
};

const CHECKIN_DAY_OPTIONS = [
  { value: 0, label: "Domingo" },
  { value: 6, label: "Sábado" },
  { value: 1, label: "Segunda" },
  { value: 5, label: "Sexta" },
];

type SplitPreset = {
  id: string;
  label: string;
  plan: SplitWeekPlan;
};

const SPLIT_PRESETS: SplitPreset[] = [
  {
    id: "abc",
    label: "ABC",
    plan: {
      1: { kind: "treino", treinoId: "treino-a" },
      2: { kind: "treino", treinoId: "treino-b" },
      3: { kind: "treino", treinoId: "treino-c" },
      4: { kind: "rest" },
      5: { kind: "treino", treinoId: "treino-a" },
      6: { kind: "cardio" },
      0: { kind: "rest" },
    },
  },
  {
    id: "abcd",
    label: "ABCD",
    plan: {
      1: { kind: "treino", treinoId: "treino-a" },
      2: { kind: "treino", treinoId: "treino-b" },
      3: { kind: "treino", treinoId: "treino-c" },
      4: { kind: "treino", treinoId: "treino-d" },
      5: { kind: "cardio" },
      6: { kind: "cardio" },
      0: { kind: "rest" },
    },
  },
  {
    id: "abcde",
    label: "ABCDE",
    plan: {
      1: { kind: "treino", treinoId: "treino-a" },
      2: { kind: "treino", treinoId: "treino-b" },
      3: { kind: "treino", treinoId: "treino-c" },
      4: { kind: "treino", treinoId: "treino-d" },
      5: { kind: "treino", treinoId: "treino-e" },
      6: { kind: "cardio" },
      0: { kind: "rest" },
    },
  },
  {
    id: "sem-treino",
    label: "Ainda não quero cadastrar treino",
    plan: {
      1: { kind: "rest" },
      2: { kind: "rest" },
      3: { kind: "rest" },
      4: { kind: "rest" },
      5: { kind: "rest" },
      6: { kind: "rest" },
      0: { kind: "rest" },
    },
  },
];

function PrimaryButton({
  label,
  onPress,
  disabled,
  testID,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={{
        backgroundColor: disabled
          ? theme.colors.bg.elevated
          : theme.colors.accent.DEFAULT,
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
          color: disabled
            ? theme.colors.text.muted
            : theme.colors.primary.onContainer,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "numeric" | "default";
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={theme.typography.labelMedium}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.muted}
        keyboardType={keyboardType ?? "default"}
        style={{
          ...theme.typography.body,
          backgroundColor: theme.colors.bg.elevated,
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}
        accessibilityLabel={label}
      />
    </View>
  );
}

function OptionRow({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((option) => {
        const active = selected === option;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: active
                ? theme.colors.accent.DEFAULT
                : theme.colors.border,
              backgroundColor: active
                ? withAlpha(theme.colors.accent.DEFAULT, 0.15)
                : theme.colors.bg.card,
            }}
          >
            <Text
              style={{
                ...theme.typography.body,
                color: active
                  ? theme.colors.accent.DEFAULT
                  : theme.colors.text.primary,
                fontWeight: active ? "700" : "400",
              }}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PathCard({
  title,
  description,
  cta,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  cta: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      style={{
        backgroundColor: theme.colors.bg.card,
        borderWidth: 1.5,
        borderColor: selected
          ? theme.colors.accent.DEFAULT
          : theme.colors.border,
        borderRadius: theme.radius.lg,
        padding: 20,
        gap: 8,
      }}
    >
      <Text style={theme.typography.title3}>{title}</Text>
      <Text style={theme.typography.footnote}>{description}</Text>
      <Text
        style={{
          ...theme.typography.callout,
          color: theme.colors.accent.DEFAULT,
          fontWeight: "700",
          marginTop: 4,
        }}
      >
        {cta} →
      </Text>
    </Pressable>
  );
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.colors.bg.card,
        borderRadius: theme.radius.md,
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <Text style={theme.typography.footnote}>{label}</Text>
      <Text
        style={{
          ...theme.typography.body,
          fontWeight: "600",
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const athlete = useAthleteStore();
  const setOnboardingComplete = useProtocolStore(
    (s) => s.setOnboardingComplete,
  );
  const setCustomPlano = useProtocolStore((s) => s.setCustomPlano);
  const setPlanPrefs = useProtocolStore((s) => s.setPlanPrefs);
  const setMetas = useProtocolStore((s) => s.setMetas);
  const customPlano = useProtocolStore((s) => s.customPlano);
  const storeCloseoutTime = useProtocolStore((s) => s.closeoutTime);
  const setWeekDaySlot = useSplitStore((s) => s.setWeekDaySlot);
  const splitWeekPlan = useSplitStore((s) => s.splitWeekPlan);

  const [path, setPath] = useState<PlanOrigin | null>(null);
  const [coachSimpleMode, setCoachSimpleMode] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: readonly StepName[] =
    path === "manual_base"
      ? [...SHARED_STEPS, ...MANUAL_STEPS]
      : coachSimpleMode
        ? [...SHARED_STEPS, ...COACH_SIMPLE_STEPS]
        : [...SHARED_STEPS, ...COACH_STEPS];
  const step: StepName = steps[stepIndex];

  // Compartilhado
  const [objective, setObjective] = useState<Objective | "">(
    athlete.objective,
  );
  const [showDate, setShowDate] = useState(athlete.showDate);
  const [targetCategory, setTargetCategory] = useState(
    athlete.competitiveExperience,
  );
  const [name, setName] = useState(athlete.name);
  const [gender, setGender] = useState<Gender | "">(athlete.gender);
  const [heightCm, setHeightCm] = useState(
    athlete.heightCm ? String(athlete.heightCm) : "",
  );
  const [weightKg, setWeightKg] = useState(
    athlete.currentWeightKg ? String(athlete.currentWeightKg) : "",
  );
  const [level, setLevel] = useState<ExperienceLevel | "">(
    athlete.experienceLevel,
  );
  const [checkInDay, setCheckInDay] = useState(athlete.checkInDay);
  const [checkInMode, setCheckInMode] = useState<CheckInMode>(
    athlete.checkInMode,
  );

  // Caminho coach
  const [coachName, setCoachName] = useState(athlete.coachName);
  const [coachContact, setCoachContact] = useState(athlete.coachContact);
  const [coachNotes, setCoachNotes] = useState(athlete.coachNotes);
  const [aguaMl, setAguaMl] = useState("3000");
  const [cardioMin, setCardioMin] = useState("30");

  // Plano importado já traz metas detectadas pelo parser — prefil para o
  // usuário só revisar em vez de redigitar (água/cardio do plano; fechamento
  // já persistido em planPrefs pela tela de import).
  useEffect(() => {
    if (!customPlano) return;
    setAguaMl(String(customPlano.metaHidratacao.aguaMl));
    setCardioMin(String(customPlano.metaCardioMin));
    setCloseoutTime(storeCloseoutTime || "21:00");
  }, [customPlano, storeCloseoutTime]);

  // Caminho manual
  const [baseAguaMl, setBaseAguaMl] = useState("3000");
  const [mealsCount, setMealsCount] = useState("5");
  const [baseCardioMin, setBaseCardioMin] = useState("30");
  const [closeoutTime, setCloseoutTime] = useState("21:00");
  const [mealNames, setMealNames] = useState<string[]>(suggestMealNames(5));
  const [splitPresetId, setSplitPresetId] = useState<string>("abcde");
  const [freeMealChoice, setFreeMealChoice] = useState<"nao" | "semanal">(
    "nao",
  );

  function next() {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }
  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function handleEnterDemo() {
    seedDemoData();
    setOnboardingComplete(true);
    router.replace("/(tabs)");
  }

  function handlePathSelect(selected: PlanOrigin) {
    setPath(selected);
    athlete.updateProfile({ hasCoach: selected === "coach_import" });
    setStepIndex(1);
  }

  function handleObjetivoNext() {
    if (!objective) {
      Alert.alert("Objetivo", "Escolha um objetivo para continuar.");
      return;
    }
    athlete.updateProfile({
      objective,
      phase: OBJECTIVE_LABELS[objective],
      showDate: objective === "prep" ? showDate.trim() : "",
      competitiveExperience: objective === "prep" ? targetCategory.trim() : "",
    });
    next();
  }

  function handlePerfilNext() {
    const h = Number(heightCm);
    const w = Number(weightKg);
    if (!name.trim() || (gender !== "male" && gender !== "female")) {
      Alert.alert("Perfil incompleto", "Preencha nome e sexo para continuar.");
      return;
    }
    if (!h || h < 140 || h > 220 || !w || w < 40 || w > 180) {
      Alert.alert(
        "Medidas inválidas",
        "Altura entre 140–220 cm e peso entre 40–180 kg.",
      );
      return;
    }
    athlete.updateProfile({
      name: name.trim(),
      gender,
      heightCm: h,
      currentWeightKg: w,
      experienceLevel: level || "iniciante",
    });
    next();
  }

  function handleCheckInsNext() {
    athlete.updateProfile({ checkInDay, checkInMode });
    next();
  }

  function handleCoachNext() {
    athlete.updateProfile({
      coachName: coachName.trim(),
      coachContact: coachContact.trim(),
      coachNotes: coachNotes.trim(),
    });
    next();
  }

  function handleMetasNext() {
    setPlanPrefs({
      closeoutTime: /^\d{1,2}:\d{2}$/.test(closeoutTime.trim())
        ? closeoutTime.trim()
        : "21:00",
    });
    if (customPlano) {
      // Plano importado — só ajusta as metas por cima dele.
      setMetas({
        aguaMl: Number(aguaMl) || 3000,
        cardioMin: Number(cardioMin) || 0,
      });
    } else {
      // Sem import ("Começar simples"): cria um plano simples de refeições
      // genéricas em vez de clonar o plano padrão de exemplo.
      const plan = buildBasePlan({
        mealNames: suggestMealNames(5),
        aguaMl: Number(aguaMl) || 3000,
        cardioMin: Number(cardioMin) || 0,
        planName: "Plano do coach",
      });
      setCustomPlano(plan, "coach_import");
    }
    next();
  }

  function handleMetasBaseNext() {
    const count = Math.max(1, Math.min(8, Number(mealsCount) || 5));
    setMealNames(suggestMealNames(count));
    next();
  }

  function applyPreset(preset: SplitPreset) {
    setSplitPresetId(preset.id);
    for (const day of WEEK_DAY_ORDER) {
      setWeekDaySlot(day, preset.plan[day]);
    }
  }

  function cycleDaySlot(day: number) {
    const current = getWeekDaySlot(day, splitWeekPlan);
    const index = SPLIT_ASSIGNMENT_OPTIONS.findIndex((slot) =>
      areWeekDaySlotsEqual(slot, current),
    );
    const nextSlot: WeekDaySlot =
      SPLIT_ASSIGNMENT_OPTIONS[
        (index + 1) % SPLIT_ASSIGNMENT_OPTIONS.length
      ];
    setWeekDaySlot(day, nextSlot);
    setSplitPresetId("personalizado");
  }

  function handleActivateBasePlan() {
    const isCoachSimple = path === "coach_import";
    const plan = buildBasePlan({
      mealNames,
      aguaMl: Number(baseAguaMl) || 3000,
      cardioMin: Number(baseCardioMin) || 0,
      planName: isCoachSimple ? "Plano do coach (simples)" : undefined,
    });
    if (plan.periodos.length === 0) {
      Alert.alert(
        "Plano incompleto",
        "Seu plano-base precisa de pelo menos uma refeição.",
      );
      return;
    }
    // Caminho coach preserva a origem/rótulo do coach mesmo no plano simples.
    setCustomPlano(plan, isCoachSimple ? "coach_import" : "manual_base");
    setPlanPrefs({
      closeoutTime: /^\d{1,2}:\d{2}$/.test(closeoutTime.trim())
        ? closeoutTime.trim()
        : "21:00",
      freeMealEnabled: freeMealChoice === "semanal",
    });
    next();
  }

  function handleFinish() {
    setOnboardingComplete(true);
    router.replace("/(tabs)");
  }

  const trainingDays = WEEK_DAY_ORDER.filter(
    (day) => getWeekDaySlot(day, splitWeekPlan).kind === "treino",
  ).length;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg.primary,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      {/* Progress bar */}
      <View
        style={{
          flexDirection: "row",
          gap: 4,
          paddingHorizontal: 16,
          marginBottom: 24,
        }}
      >
        {steps.map((s, i) => (
          <View
            key={s}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor:
                i <= stepIndex
                  ? theme.colors.accent.DEFAULT
                  : theme.colors.bg.elevated,
            }}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 20, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {step === "path" && (
          <View style={{ gap: 16, flex: 1, justifyContent: "center" }}>
            <Text style={theme.typography.titleLarge}>ShapeIQ</Text>
            <Text style={theme.typography.headline}>
              Como você quer começar?
            </Text>
            <PathCard
              title="Tenho coach"
              description="Vou importar ou cadastrar o plano que meu coach me passou."
              cta="Importar plano"
              selected={path === "coach_import"}
              onPress={() => handlePathSelect("coach_import")}
            />
            <PathCard
              title="Estou sem coach"
              description="Quero montar um plano-base manual para executar e revisar minha rotina."
              cta="Montar plano-base"
              selected={path === "manual_base"}
              onPress={() => handlePathSelect("manual_base")}
            />
            <Text style={theme.typography.caption}>
              O ShapeIQ ajuda na execução e revisão da sua rotina. Ele não
              substitui coach, nutricionista, médico ou avaliação profissional.
            </Text>
            <Pressable
              onPress={handleEnterDemo}
              accessibilityRole="button"
              accessibilityLabel="Entrar em modo demo"
              style={{
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  ...theme.typography.footnote,
                  color: theme.colors.text.secondary,
                }}
              >
                Só explorando? Entrar em modo demo
              </Text>
            </Pressable>
          </View>
        )}

        {step === "objetivo" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>
              Qual é seu objetivo agora?
            </Text>
            <Text style={theme.typography.footnote}>
              Isso muda como o app organiza seu painel e suas revisões.
            </Text>
            <OptionRow
              options={OBJECTIVE_OPTIONS.map(([, label]) => label)}
              selected={objective ? OBJECTIVE_LABELS[objective] : ""}
              onSelect={(label) => {
                const found = OBJECTIVE_OPTIONS.find(
                  ([, l]) => l === label,
                );
                if (found) setObjective(found[0]);
              }}
            />
            {objective === "prep" && (
              <>
                <Field
                  label="DATA DO CAMPEONATO (AAAA-MM-DD, OPCIONAL)"
                  value={showDate}
                  onChangeText={setShowDate}
                  placeholder="2026-10-15"
                />
                <Field
                  label="CATEGORIA PRETENDIDA (OPCIONAL)"
                  value={targetCategory}
                  onChangeText={setTargetCategory}
                  placeholder="Men's Physique"
                />
              </>
            )}
            <PrimaryButton label="Continuar" onPress={handleObjetivoNext} />
          </View>
        )}

        {step === "perfil" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>Perfil básico</Text>
            <Text style={theme.typography.footnote}>
              Esses dados ajudam a organizar metas e comparações. Não usamos
              isso como diagnóstico.
            </Text>
            <Field label="NOME" value={name} onChangeText={setName} />
            <View style={{ gap: 6 }}>
              <Text style={theme.typography.labelMedium}>SEXO</Text>
              <OptionRow
                options={["Masculino", "Feminino"]}
                selected={
                  gender === "male"
                    ? "Masculino"
                    : gender === "female"
                      ? "Feminino"
                      : ""
                }
                onSelect={(v) =>
                  setGender(v === "Masculino" ? "male" : "female")
                }
              />
            </View>
            <Field
              label="ALTURA (CM)"
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
            />
            <Field
              label="PESO ATUAL (KG)"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="numeric"
            />
            <View style={{ gap: 6 }}>
              <Text style={theme.typography.labelMedium}>NÍVEL</Text>
              <OptionRow
                options={EXPERIENCE_OPTIONS.map(([, label]) => label)}
                selected={level ? EXPERIENCE_LABELS[level] : ""}
                onSelect={(label) => {
                  const found = EXPERIENCE_OPTIONS.find(
                    ([, l]) => l === label,
                  );
                  if (found) setLevel(found[0]);
                }}
              />
            </View>
            <PrimaryButton label="Continuar" onPress={handlePerfilNext} />
          </View>
        )}

        {step === "checkins" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>Check-ins</Text>
            <Text style={theme.typography.footnote}>
              Check-ins servem como evidência visual de tendência. Compare
              sempre com luz, ângulo e distância parecidos.
            </Text>
            <View style={{ gap: 6 }}>
              <Text style={theme.typography.labelMedium}>
                DIA PREFERIDO DO CHECK-IN
              </Text>
              <OptionRow
                options={CHECKIN_DAY_OPTIONS.map((o) => o.label)}
                selected={
                  CHECKIN_DAY_OPTIONS.find((o) => o.value === checkInDay)
                    ?.label ?? "Domingo"
                }
                onSelect={(label) => {
                  const found = CHECKIN_DAY_OPTIONS.find(
                    (o) => o.label === label,
                  );
                  if (found) setCheckInDay(found.value);
                }}
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={theme.typography.labelMedium}>MODO PREFERIDO</Text>
              <OptionRow
                options={["Rápido: 1 foto", "Completo: 4 fotos"]}
                selected={
                  checkInMode === "quick"
                    ? "Rápido: 1 foto"
                    : "Completo: 4 fotos"
                }
                onSelect={(label) =>
                  setCheckInMode(
                    label.startsWith("Rápido") ? "quick" : "full",
                  )
                }
              />
            </View>
            <PrimaryButton label="Continuar" onPress={handleCheckInsNext} />
          </View>
        )}

        {/* ——— Caminho A: Tenho coach ——— */}

        {step === "coach" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>Dados do coach</Text>
            <Field
              label="NOME DO COACH (OPCIONAL)"
              value={coachName}
              onChangeText={setCoachName}
            />
            <Field
              label="CONTATO (OPCIONAL)"
              value={coachContact}
              onChangeText={setCoachContact}
            />
            <Field
              label="OBSERVAÇÕES (OPCIONAL)"
              value={coachNotes}
              onChangeText={setCoachNotes}
            />
            <PrimaryButton label="Continuar" onPress={handleCoachNext} />
          </View>
        )}

        {step === "protocolo" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>
              Como quer cadastrar seu plano?
            </Text>
            <Text style={theme.typography.footnote}>
              Você vai revisar tudo antes de ativar.
            </Text>
            <Pressable
              onPress={() => router.push("/import-protocol")}
              accessibilityRole="button"
              accessibilityLabel="Colar plano do coach"
              style={{
                backgroundColor: theme.colors.bg.card,
                borderWidth: 1,
                borderColor: theme.colors.accent.DEFAULT,
                borderRadius: theme.radius.lg,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <AppIcon
                sf="doc.on.clipboard"
                mci="clipboard-text-outline"
                size={22}
                color={theme.colors.accent.DEFAULT}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ ...theme.typography.callout }}>
                  Colar plano
                </Text>
                <Text style={theme.typography.caption}>
                  {customPlano
                    ? `Importado: ${customPlano.nome}`
                    : "Cole texto do WhatsApp, PDF, Notas ou mensagem do coach."}
                </Text>
              </View>
              {customPlano ? (
                <AppIcon
                  sf="checkmark.circle.fill"
                  mci="check-circle"
                  size={20}
                  color={theme.colors.semantic.success}
                />
              ) : null}
            </Pressable>
            <Pressable
              onPress={() => {
                setCoachSimpleMode(true);
                next();
              }}
              accessibilityRole="button"
              accessibilityLabel="Começar simples"
              style={{
                backgroundColor: theme.colors.bg.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                padding: 16,
                gap: 4,
              }}
            >
              <Text style={{ ...theme.typography.callout }}>
                Começar simples
              </Text>
              <Text style={theme.typography.caption}>
                Crie só as metas principais agora e detalhe depois em
                Configurações.
              </Text>
            </Pressable>
            <PrimaryButton
              label={customPlano ? "Continuar" : "Continuar sem importar"}
              onPress={() => {
                // Sem plano importado, "continuar" também passa pelo
                // construtor de plano-base para gerar um plano utilizável.
                setCoachSimpleMode(!customPlano);
                next();
              }}
            />
          </View>
        )}

        {step === "metas" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>Metas diárias</Text>
            <Text style={theme.typography.footnote}>
              {customPlano
                ? "Detectamos estas metas no plano importado. Revise e ajuste se precisar."
                : "Você define as metas. O ShapeIQ só organiza a execução."}
            </Text>
            <Field
              label="ÁGUA (ML)"
              value={aguaMl}
              onChangeText={setAguaMl}
              keyboardType="numeric"
            />
            <Field
              label="CARDIO (MIN/DIA)"
              value={cardioMin}
              onChangeText={setCardioMin}
              keyboardType="numeric"
            />
            <Field
              label="FECHAMENTO DO DIA (HH:MM)"
              value={closeoutTime}
              onChangeText={setCloseoutTime}
              keyboardType="numeric"
              placeholder="21:00"
            />
            <PrimaryButton
              label="Ativar plano"
              onPress={handleMetasNext}
              testID="activate-plan-cta"
            />
          </View>
        )}

        {/* ——— Caminho B: Estou sem coach ——— */}

        {step === "metasBase" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>
              Quais metas quer acompanhar?
            </Text>
            <Text style={theme.typography.footnote}>
              Você define as metas. O ShapeIQ só organiza a execução.
            </Text>
            <Field
              label="ÁGUA POR DIA (ML)"
              value={baseAguaMl}
              onChangeText={setBaseAguaMl}
              keyboardType="numeric"
              placeholder="3000"
            />
            <View style={{ gap: 6 }}>
              <Text style={theme.typography.labelMedium}>
                REFEIÇÕES POR DIA
              </Text>
              <OptionRow
                options={["3", "4", "5", "6"]}
                selected={mealsCount}
                onSelect={setMealsCount}
              />
            </View>
            <Field
              label="CARDIO (MIN/DIA — 0 SE NÃO TIVER)"
              value={baseCardioMin}
              onChangeText={setBaseCardioMin}
              keyboardType="numeric"
              placeholder="30"
            />
            <Field
              label="FECHAMENTO DO DIA (HH:MM)"
              value={closeoutTime}
              onChangeText={setCloseoutTime}
              keyboardType="numeric"
              placeholder="21:00"
            />
            <PrimaryButton label="Continuar" onPress={handleMetasBaseNext} />
          </View>
        )}

        {step === "refeicoes" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>Monte suas refeições</Text>
            <Text style={theme.typography.footnote}>
              Renomeie os períodos como preferir. Cada refeição vira um item do
              seu checklist diário.
            </Text>
            {mealNames.map((mealName, index) => (
              <Field
                key={index}
                label={`REFEIÇÃO ${index + 1}`}
                value={mealName}
                onChangeText={(text) =>
                  setMealNames((names) =>
                    names.map((n, i) => (i === index ? text : n)),
                  )
                }
              />
            ))}
            <PrimaryButton
              label="Continuar"
              onPress={() => {
                if (mealNames.every((n) => !n.trim())) {
                  Alert.alert(
                    "Refeições",
                    "Defina pelo menos uma refeição para continuar.",
                  );
                  return;
                }
                next();
              }}
            />
          </View>
        )}

        {step === "treinoSemana" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>
              Como é sua semana de treino?
            </Text>
            <OptionRow
              options={SPLIT_PRESETS.map((p) => p.label)}
              selected={
                SPLIT_PRESETS.find((p) => p.id === splitPresetId)?.label ?? ""
              }
              onSelect={(label) => {
                const preset = SPLIT_PRESETS.find((p) => p.label === label);
                if (preset) applyPreset(preset);
              }}
            />
            <Text style={theme.typography.footnote}>
              Toque em um dia para alternar entre treino, cardio e descanso.
            </Text>
            <View style={{ gap: 8 }}>
              {WEEK_DAY_ORDER.map((day) => {
                const slot = getWeekDaySlot(day, splitWeekPlan);
                return (
                  <Pressable
                    key={day}
                    onPress={() => cycleDaySlot(day)}
                    accessibilityRole="button"
                    accessibilityLabel={`${WEEKDAY_LABELS[day]}: ${formatWeekDaySlotShort(slot)}`}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: theme.colors.bg.card,
                      borderRadius: theme.radius.md,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                    }}
                  >
                    <Text style={theme.typography.body}>
                      {WEEKDAY_LABELS[day]}
                    </Text>
                    <Text
                      style={{
                        ...theme.typography.body,
                        fontWeight: "600",
                        color:
                          slot.kind === "treino"
                            ? theme.colors.accent.DEFAULT
                            : theme.colors.text.secondary,
                      }}
                    >
                      {formatWeekDaySlotShort(slot)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <PrimaryButton label="Continuar" onPress={next} />
          </View>
        )}

        {step === "refeicaoLivre" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>
              Vai usar refeição livre?
            </Text>
            <Text style={theme.typography.footnote}>
              Refeição livre entra como parte do plano quando configurada. Fora
              disso, aparece como vazamento se afetar uma refeição obrigatória.
            </Text>
            <OptionRow
              options={["Não usar no plano-base", "1x por semana"]}
              selected={
                freeMealChoice === "semanal"
                  ? "1x por semana"
                  : "Não usar no plano-base"
              }
              onSelect={(label) =>
                setFreeMealChoice(
                  label === "1x por semana" ? "semanal" : "nao",
                )
              }
            />
            <PrimaryButton label="Continuar" onPress={next} />
          </View>
        )}

        {step === "revisao" && (
          <View style={{ gap: 16 }}>
            <Text style={theme.typography.title3}>Revise seu plano-base</Text>
            <ReviewLine
              label="Água"
              value={`${Number(baseAguaMl) || 3000} ml/dia`}
            />
            <ReviewLine
              label="Refeições"
              value={`${mealNames.filter((n) => n.trim()).length} por dia`}
            />
            <ReviewLine
              label="Cardio"
              value={
                Number(baseCardioMin) > 0
                  ? `${Number(baseCardioMin)} min/dia`
                  : "Sem cardio"
              }
            />
            <ReviewLine
              label="Treino"
              value={`${trainingDays} dia${trainingDays === 1 ? "" : "s"}/semana`}
            />
            <ReviewLine
              label="Check-in"
              value={
                CHECKIN_DAY_OPTIONS.find((o) => o.value === checkInDay)
                  ?.label ?? "Domingo"
              }
            />
            <ReviewLine label="Fechamento" value={closeoutTime || "21:00"} />
            <ReviewLine
              label="Refeição livre"
              value={freeMealChoice === "semanal" ? "1x/semana" : "Não usar"}
            />
            <Text style={theme.typography.caption}>
              Esse será seu painel inicial. Você pode editar qualquer parte
              depois.
            </Text>
            <PrimaryButton
              label="Ativar plano-base"
              onPress={handleActivateBasePlan}
              testID="activate-plan-cta"
            />
          </View>
        )}

        {step === "pronto" && (
          <View style={{ gap: 16, flex: 1, justifyContent: "center" }}>
            <AppIcon
              sf="checkmark.seal.fill"
              mci="check-decagram"
              size={48}
              color={theme.colors.semantic.success}
            />
            <Text style={theme.typography.title3}>
              Seu painel está pronto
            </Text>
            <Text style={theme.typography.body}>
              Plano ativo. A próxima ação será calculada em Hoje — sempre uma
              só. Check-in e fechamento diário já estão configurados.
            </Text>
            <PrimaryButton label="Ir para Hoje" onPress={handleFinish} />
            <Pressable
              onPress={() => {
                setOnboardingComplete(true);
                router.replace("/(tabs)/(progresso)/new-checkin");
              }}
              accessibilityRole="button"
              accessibilityLabel="Criar check-in inicial"
              style={{
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  ...theme.typography.callout,
                  color: theme.colors.accent.DEFAULT,
                }}
              >
                Criar check-in inicial
              </Text>
            </Pressable>
          </View>
        )}

        {stepIndex > 0 && step !== "pronto" && (
          <Pressable
            onPress={back}
            accessibilityRole="button"
            accessibilityLabel="Voltar ao passo anterior"
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
        )}
      </ScrollView>
    </View>
  );
}
