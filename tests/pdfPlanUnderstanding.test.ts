import {
  formatSectionsForAi,
  segmentPdfDocument,
  trainingPlanToTreinos,
  understandPdfPlan,
  buildPdfDocument,
} from "@/utils/pdfPlanUnderstanding";

const PAGES = [
  `
Texto institucional sem relacao com o plano.
Neste sentido, o aumento do dialogo entre setores produtivos cumpre papel essencial.
`,
  `
PLANEJAMENTO ATLETA TESTE, MAIO/2026.
Idade: 26 anos
Peso: 90kg
Protocolo hormonal:
500mg exemplo hormonal/semana
0,5mg exemplo medicamento/segunda e sexta
ATENCAO: consulte um medico.
PROTOCOLO NUTRICIONAL:
Em jejum: 220mg cafeina + 10mg ioimbina
Refeicao 1 (desjejum)
- 3 ovos inteiros
- 30g whey
- 25g aveia
Refeicao 2 (pre treino)
- 225g peito de frango ou file de tilapia
- 100g batata inglesa
- 100g vegetais
`,
  `
INTRA TREINO: 40g intensity hunter + 10g glutamina + 10g creatina
Refeicao 3 (pos treino)
- 60g whey
Refeicao 4
- 225g peito de frango ou file de tilapia
- 100g vegetais
Refeicao 5 (ceia)
- 200g peito de frango ou file de tilapia
- 100g mamao ou abacaxi
`,
  `
*Alimentos pesados ja preparados/prontos/cozidos.
*Use temperos naturais com moderacao.
*Refeicoes livres: 1 refeicao livre na semana, em dia de treino.
*Cardios: 70min todos os dias, pode dividir em 2 sessoes.
*Agua: 4 litros todos os dias.
`,
  `
ROTINA/PERIODIZACAO DE TREINAMENTO:
A: Peito
B: Costas
C: Pernas
D: Ombros
E: Bracos
A:
- Supino inclinado maquina 2x WS + 2x TS
- Crucifixo inclinado halteres 2x WS + 1x TS + 1x BS (15)
B:
- Remada curvada 2x WS + 2x TS
- Puxada frente 3x WS
C:
- Agachamento smith 2x WS + 2x TS
`,
  `
- Mesa flexora 2x WS + 1x TS + 1x CS (5+5+5/10seg)
D:
- Desenvolvimento maquina 2x WS + 2x TS
- Elevacao lateral maquina (1seg pico de contracao) 2x WS + 1x TS + 1x CS (5+5+5)
E:
- Rosca martelo 2x WS + 1x TS
- Triceps corda 2x WS + 1x TS
Observacoes:
*Fazer aquecimento antes dos primeiros exercicios.
`,
  `
*Series de trabalho (WS), top sets (TS), backoff sets (BS) e cluster sets (CS) sao series validas.
*Quando houver CS, respeitar o descanso indicado entre blocos.
`,
];

const RAW_TEXT = PAGES.join("\n");

describe("pdf plan understanding", () => {
  it("segments boilerplate, nutrition, training and guidance sections", () => {
    const document = buildPdfDocument(RAW_TEXT, PAGES);
    const sections = segmentPdfDocument(document);

    expect(sections[0].role).toBe("boilerplate");
    expect(sections.some((section) => section.role === "sensitive_protocol")).toBe(true);
    expect(sections.some((section) => section.role === "meal_period")).toBe(true);
    expect(sections.some((section) => section.role === "training_group")).toBe(true);
    expect(sections.some((section) => section.role === "training_guidance")).toBe(true);
  });

  it("extracts meal portions while keeping tips out of checklist", () => {
    const result = understandPdfPlan(RAW_TEXT, PAGES).parsedPlan;

    expect(result.mealPeriods).toHaveLength(7);
    expect(result.mealPeriods[1].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "whey", quantity: "30g" }),
        expect.objectContaining({ title: "aveia", quantity: "25g" }),
      ]),
    );
    expect(result.mealPeriods.flatMap((period) => period.items.map((item) => item.title))).not.toContain(
      "Use temperos naturais com moderacao.",
    );
    expect(result.nutritionGuidance.join(" ")).toContain("temperos naturais");
  });

  it("keeps sensitive protocol out of meals", () => {
    const result = understandPdfPlan(RAW_TEXT, PAGES).parsedPlan;

    expect(result.sensitiveItems.length).toBeGreaterThan(0);
    expect(result.mealPeriods.flatMap((period) => period.items.map((item) => item.title)).join(" ")).not.toMatch(
      /hormonal|medicamento/i,
    );
  });

  it("extracts cardio, hydration and free meal context", () => {
    const result = understandPdfPlan(RAW_TEXT, PAGES).parsedPlan;

    expect(result.cardioTargetMin).toBe(70);
    expect(result.cardioTargetType).toBe("daily");
    expect(result.waterTargetMl).toBe(4000);
    expect(result.freeMeal?.enabled).toBe(true);
    expect(result.coachTips.join(" ")).toContain("refeicao livre");
  });

  it("extracts training split groups, exercises, sets and guidance", () => {
    const result = understandPdfPlan(RAW_TEXT, PAGES).parsedPlan;

    expect(result.trainingPlan?.split).toBe("ABCDE");
    expect(result.trainingPlan?.groups.map((group) => group.code)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
    ]);
    const groupA = result.trainingPlan!.groups[0];
    expect(groupA.label).toBe("Peito");
    expect(groupA.exercises).toHaveLength(2);
    expect(groupA.exercises[1].sets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "BS", count: 1, reps: "15" }),
      ]),
    );
    const groupC = result.trainingPlan!.groups[2];
    expect(groupC.exercises[1].sets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "CS", count: 1, reps: "5+5+5", notes: "10seg" }),
      ]),
    );
    expect(result.trainingPlan!.guidance.join(" ")).toContain("aquecimento");
  });

  it("converts imported training to the existing Treino catalog shape", () => {
    const result = understandPdfPlan(RAW_TEXT, PAGES).parsedPlan;
    const treinos = trainingPlanToTreinos(result.trainingPlan);

    expect(treinos).toHaveLength(5);
    expect(treinos[0]).toMatchObject({
      id: "treino-a",
      letra: "A",
      grupoMuscular: "Peito",
    });
    expect(treinos[0].exercicios[0].series[0]).toMatchObject({
      tipo: "WS",
      series: 2,
    });
  });

  it("formats sections for AI without boilerplate", () => {
    const sections = understandPdfPlan(RAW_TEXT, PAGES).sections;
    const context = formatSectionsForAi(sections);

    expect(context).toContain("[MEAL_PERIOD");
    expect(context).toContain("[TRAINING_GROUP");
    expect(context).not.toContain("Texto institucional sem relacao");
  });

  it("parses meal items starting with bullet characters • – ➔", () => {
    const pages = [
      `
PROTOCOLO NUTRICIONAL:
Refeicao 1 (desjejum)
• 3 ovos inteiros
– 30g whey
➔ 25g aveia
`,
    ];
    const result = understandPdfPlan(pages.join("\n"), pages).parsedPlan;

    expect(result.mealPeriods).toHaveLength(1);
    const items = result.mealPeriods[0].items;
    expect(items.some((item) => item.title === "3 ovos inteiros")).toBe(true);
    expect(items.some((item) => item.title === "whey" && item.quantity === "30g")).toBe(true);
    expect(items.some((item) => item.title === "aveia" && item.quantity === "25g")).toBe(true);
  });

  it("moves sensitive lines embedded in meal sections to sensitiveItems, not meal items", () => {
    const pages = [
      `
PROTOCOLO NUTRICIONAL:
Refeicao 1 (desjejum)
• 3 ovos inteiros
• 30g whey
• 200mg testosterona enantato
`,
    ];
    const result = understandPdfPlan(pages.join("\n"), pages).parsedPlan;

    const mealItemTitles = result.mealPeriods.flatMap((period) =>
      period.items.map((item) => item.title),
    );
    expect(mealItemTitles.join(" ")).not.toMatch(/testosterona|enantato/i);
    expect(result.sensitiveItems.length).toBeGreaterThan(0);
    expect(result.sensitiveItems.some((item) => /testosterona|enantato/i.test(item.text))).toBe(true);
  });
});
