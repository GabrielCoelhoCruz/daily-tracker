import {
  aiPlanToPlano,
  extractAiJsonPayload,
  isPdfMagic,
  normalizeCardioMin,
  normalizeCloseoutTime,
  normalizeTrainingSplit,
  normalizeWaterMl,
  parserResultToAiPlan,
  repairTruncatedAiJson,
  validateAiParsedPlan,
  type AiParsedPlan,
} from "@/utils/aiPlanImport";
import { parseCoachPlan } from "@/utils/planImportUtils";

/**
 * Fixture equivalente ao PDF de teste (texto extraído):
 * Café da manhã (Ovos, Aveia) · Almoço (Arroz, Frango, Legumes) ·
 * Jantar (Carne, Salada) · Água 3000 ml · Cardio 40 min ·
 * Treino ABCDE · Fechamento do dia 21:00
 */
function buildFixtureAiJson(): Record<string, unknown> {
  const item = (title: string) => ({
    title,
    quantity: null,
    unit: null,
    required: true,
    sourceText: title,
    confidence: "alta",
  });
  return {
    source: "pdf_ai",
    title: "Plano do coach",
    summary: "3 refeições, água, cardio e treino ABCDE.",
    confidence: "alta",
    waterTargetMl: 3000,
    cardioTargetMin: 40,
    cardioTargetType: "daily",
    closeoutTime: "21:00",
    trainingSplit: "ABCDE",
    trainingDays: [],
    mealPeriods: [
      {
        name: "Café da manhã",
        timeWindow: null,
        items: [item("Ovos"), item("Aveia")],
        sourceText: "Café da manhã: Ovos, Aveia",
        confidence: "alta",
      },
      {
        name: "Almoço",
        timeWindow: null,
        items: [item("Arroz"), item("Frango"), item("Legumes")],
        sourceText: null,
        confidence: "alta",
      },
      {
        name: "Jantar",
        timeWindow: null,
        items: [item("Carne"), item("Salada")],
        sourceText: null,
        confidence: "alta",
      },
    ],
    supplements: [],
    freeMeal: null,
    checkInInstructions: null,
    observations: [],
    sensitiveItems: [],
    unmapped: [],
    rawTextPreview: null,
    trainingPlan: null,
    coachTips: [],
    nutritionGuidance: [],
  };
}

describe("normalizadores", () => {
  it("converte água L → ml", () => {
    expect(normalizeWaterMl("3L")).toBe(3000);
    expect(normalizeWaterMl("3,5L")).toBe(3500);
    expect(normalizeWaterMl("3000 ml")).toBe(3000);
    expect(normalizeWaterMl(3000)).toBe(3000);
    // Número pequeno veio em litros por engano do modelo.
    expect(normalizeWaterMl(3.5)).toBe(3500);
    expect(normalizeWaterMl(null)).toBeNull();
    expect(normalizeWaterMl("sem meta")).toBeNull();
  });

  it("extrai minutos de cardio", () => {
    expect(normalizeCardioMin("40 min")).toBe(40);
    expect(normalizeCardioMin(40)).toBe(40);
    expect(normalizeCardioMin(null)).toBeNull();
  });

  it("normaliza fechamento para HH:MM", () => {
    expect(normalizeCloseoutTime("21:00")).toBe("21:00");
    expect(normalizeCloseoutTime("21h")).toBe("21:00");
    expect(normalizeCloseoutTime("21h30")).toBe("21:30");
    expect(normalizeCloseoutTime("9:05")).toBe("09:05");
    expect(normalizeCloseoutTime("25:00")).toBeNull();
    expect(normalizeCloseoutTime(null)).toBeNull();
  });

  it("normaliza split de treino", () => {
    expect(normalizeTrainingSplit("ABCDE")).toBe("ABCDE");
    expect(normalizeTrainingSplit("Treino ABCDE")).toBe("ABCDE");
    expect(normalizeTrainingSplit("abc")).toBe("ABC");
    expect(normalizeTrainingSplit("XYZ")).toBeNull();
    expect(normalizeTrainingSplit(null)).toBeNull();
  });

  it("detecta assinatura de PDF", () => {
    expect(isPdfMagic(new TextEncoder().encode("%PDF-1.7"))).toBe(true);
    expect(isPdfMagic(new TextEncoder().encode("PK\x03\x04"))).toBe(false);
    expect(isPdfMagic(new Uint8Array(0))).toBe(false);
  });
});

describe("extractAiJsonPayload", () => {
  it("extrai JSON mesmo quando a IA adiciona prosa ao redor", () => {
    const payload = extractAiJsonPayload(
      'Claro, aqui esta:\n{"title":"Plano","summary":"Use {chaves} no texto"}\nFim.',
    );
    expect(payload).toBe('{"title":"Plano","summary":"Use {chaves} no texto"}');
    expect(JSON.parse(payload!)).toEqual({
      title: "Plano",
      summary: "Use {chaves} no texto",
    });
  });

  it("extrai JSON de markdown fence com label maiusculo", () => {
    const payload = extractAiJsonPayload(
      '```JSON\n{"source":"pdf_ai","mealPeriods":[]}\n```',
    );
    expect(payload).toBe('{"source":"pdf_ai","mealPeriods":[]}');
  });

  it("retorna null quando nao ha objeto JSON completo", () => {
    expect(extractAiJsonPayload("sem json")).toBeNull();
    expect(extractAiJsonPayload('{"title":"incompleto"')).toBeNull();
  });
});

describe("repairTruncatedAiJson", () => {
  it("fecha objeto truncado no meio de uma string", () => {
    const repaired = repairTruncatedAiJson(
      '{"title":"Plano","mealPeriods":[{"name":"Almo',
    );
    expect(repaired).not.toBeNull();
    const parsed = JSON.parse(repaired!) as Record<string, unknown>;
    expect(parsed.title).toBe("Plano");
    expect(Array.isArray(parsed.mealPeriods)).toBe(true);
  });

  it("descarta chave pendurada sem valor no fim", () => {
    const repaired = repairTruncatedAiJson(
      '{"title":"Plano","waterTargetMl":3000,"cardioTargetMin":',
    );
    expect(repaired).not.toBeNull();
    const parsed = JSON.parse(repaired!) as Record<string, unknown>;
    expect(parsed.title).toBe("Plano");
    expect(parsed.waterTargetMl).toBe(3000);
    expect("cardioTargetMin" in parsed).toBe(false);
  });

  it("recupera arrays aninhados cortados por max_tokens", () => {
    const truncated =
      '{"mealPeriods":[{"name":"Café da manhã","items":[{"title":"Ovos","required":true},{"title":"Ave';
    const repaired = repairTruncatedAiJson(truncated);
    expect(repaired).not.toBeNull();
    const parsed = JSON.parse(repaired!) as {
      mealPeriods: { name: string; items: { title: string }[] }[];
    };
    expect(parsed.mealPeriods[0].name).toBe("Café da manhã");
    expect(parsed.mealPeriods[0].items[0].title).toBe("Ovos");
  });

  it("recupera JSON truncado dentro de fence markdown sem fechamento", () => {
    const repaired = repairTruncatedAiJson('```json\n{"title":"Plano","unmapped":[');
    expect(repaired).not.toBeNull();
    expect(JSON.parse(repaired!)).toEqual({ title: "Plano", unmapped: [] });
  });

  it("retorna null sem objeto JSON algum", () => {
    expect(repairTruncatedAiJson("resposta em prosa, sem json")).toBeNull();
    expect(repairTruncatedAiJson("")).toBeNull();
  });

  it("nao altera JSON ja completo", () => {
    const complete = '{"title":"Plano","mealPeriods":[]}';
    const repaired = repairTruncatedAiJson(complete);
    expect(repaired).not.toBeNull();
    expect(JSON.parse(repaired!)).toEqual({ title: "Plano", mealPeriods: [] });
  });
});

describe("validateAiParsedPlan", () => {
  it("valida o fixture completo", () => {
    const result = validateAiParsedPlan(buildFixtureAiJson());
    expect(result).not.toBeNull();
    expect(result!.mealPeriods).toHaveLength(3);
    expect(result!.mealPeriods.reduce((a, p) => a + p.items.length, 0)).toBe(7);
    expect(result!.waterTargetMl).toBe(3000);
    expect(result!.cardioTargetMin).toBe(40);
    expect(result!.trainingSplit).toBe("ABCDE");
    expect(result!.closeoutTime).toBe("21:00");
  });

  it("rejeita JSON que não é objeto", () => {
    expect(validateAiParsedPlan(null)).toBeNull();
    expect(validateAiParsedPlan("texto")).toBeNull();
    expect(validateAiParsedPlan([1, 2])).toBeNull();
  });

  it("campos ausentes viram null/vazio — nunca valores inventados", () => {
    const result = validateAiParsedPlan({});
    expect(result).not.toBeNull();
    expect(result!.waterTargetMl).toBeNull();
    expect(result!.cardioTargetMin).toBeNull();
    expect(result!.cardioTargetType).toBeNull();
    expect(result!.closeoutTime).toBeNull();
    expect(result!.trainingSplit).toBeNull();
    expect(result!.mealPeriods).toEqual([]);
    expect(result!.sensitiveItems).toEqual([]);
    expect(result!.unmapped).toEqual([]);
  });

  it("treino/fechamento classificados como comida vão para unmapped", () => {
    const raw = buildFixtureAiJson();
    const meals = raw.mealPeriods as Array<{ items: unknown[] }>;
    meals[2].items.push(
      {
        title: "Treino ABCDE",
        quantity: null,
        unit: null,
        required: true,
        sourceText: "Treino ABCDE",
        confidence: "baixa",
      },
      {
        title: "Fechamento do dia 21:00",
        quantity: null,
        unit: null,
        required: true,
        sourceText: null,
        confidence: "baixa",
      },
    );
    const result = validateAiParsedPlan(raw)!;
    const jantar = result.mealPeriods[2];
    expect(jantar.items.map((i) => i.title)).toEqual(["Carne", "Salada"]);
    expect(result.unmapped.length).toBeGreaterThanOrEqual(2);
  });

  it("separa itens sensíveis e preserva unmapped", () => {
    const raw = buildFixtureAiJson();
    raw.sensitiveItems = [
      { text: "Diurético 2 dias antes", category: "diurético", sourceText: "..." },
      { text: "Item estranho", category: "categoria-invalida", sourceText: null },
    ];
    raw.unmapped = [{ text: "linha ilegível 123", reason: null }];
    const result = validateAiParsedPlan(raw)!;
    expect(result.sensitiveItems).toHaveLength(2);
    expect(result.sensitiveItems[1].category).toBe("outro sensível");
    expect(result.unmapped[0].text).toBe("linha ilegível 123");
  });

  it("cardio ambíguo mantém cardioTargetType null", () => {
    const raw = buildFixtureAiJson();
    raw.cardioTargetType = "sempre";
    const result = validateAiParsedPlan(raw)!;
    expect(result.cardioTargetType).toBeNull();
  });
});

describe("aiPlanToPlano", () => {
  function fixturePlan(): AiParsedPlan {
    return validateAiParsedPlan(buildFixtureAiJson())!;
  }

  it("converte o fixture no Plano do app", () => {
    const { plano, treinoSplit, closeoutTime } = aiPlanToPlano(fixturePlan());
    expect(plano.periodos).toHaveLength(3);
    expect(plano.periodos.reduce((a, p) => a + p.itens.length, 0)).toBe(7);
    expect(plano.metaHidratacao.aguaMl).toBe(3000);
    expect(plano.metaCardioMin).toBe(40);
    expect(treinoSplit).toBe("ABCDE");
    expect(closeoutTime).toBe("21:00");
  });

  it("treino e fechamento não aparecem como itens do Jantar", () => {
    const { plano } = aiPlanToPlano(fixturePlan());
    const jantar = plano.periodos.find((p) => p.nome === "Jantar")!;
    expect(jantar.itens.map((i) => i.nome)).toEqual(["Carne", "Salada"]);
    for (const periodo of plano.periodos) {
      for (const item of periodo.itens) {
        expect(item.nome).not.toMatch(/treino|fechamento/i);
      }
    }
  });

  it("itens sensíveis não viram checklist", () => {
    const parsed = fixturePlan();
    parsed.sensitiveItems = [
      { text: "Hormônio X 1ml", category: "hormonal", sourceText: null },
    ];
    const { plano, warnings } = aiPlanToPlano(parsed);
    for (const periodo of plano.periodos) {
      expect(periodo.itens.every((i) => !/hormônio x/i.test(i.nome))).toBe(true);
    }
    expect(warnings.some((w) => /sensíveis/i.test(w))).toBe(true);
  });

  it("metas ausentes usam defaults com aviso — sem inventar valores no parse", () => {
    const parsed = fixturePlan();
    parsed.waterTargetMl = null;
    parsed.cardioTargetMin = null;
    const { plano, warnings } = aiPlanToPlano(parsed);
    expect(plano.metaHidratacao.aguaMl).toBe(3000);
    expect(plano.metaCardioMin).toBe(0);
    expect(warnings.some((w) => /água/i.test(w))).toBe(true);
    expect(warnings.some((w) => /cardio/i.test(w))).toBe(true);
  });

  it("cardio sem tipo definido gera aviso de confirmação", () => {
    const parsed = fixturePlan();
    parsed.cardioTargetType = null;
    const { warnings } = aiPlanToPlano(parsed);
    expect(warnings.some((w) => /diário ou semanal/i.test(w))).toBe(true);
  });

  it("suplementos viram período próprio com categoria suplemento", () => {
    const parsed = fixturePlan();
    parsed.supplements = [
      {
        title: "Creatina",
        dosage: "5g",
        timing: "pós-treino",
        sourceText: null,
        confidence: "alta",
      },
    ];
    const { plano } = aiPlanToPlano(parsed);
    const sup = plano.periodos.find((p) => p.nome === "Suplementos")!;
    expect(sup.itens[0].categoria).toBe("suplemento");
    expect(sup.itens[0].dosagem).toBe("5g");
  });
});

describe("fallback determinístico (parser existente sobre texto extraído)", () => {
  const EXTRACTED = `
Café da manhã:
- Ovos
- Aveia

Almoço:
- Arroz
- Frango
- Legumes

Jantar:
- Carne
- Salada

Água 3000 ml
Cardio 40 min
Treino ABCDE
Fechamento do dia 21:00
`;

  it("parser determinístico continua correto no texto do fixture", () => {
    const result = parseCoachPlan(EXTRACTED);
    expect(result.plano.periodos).toHaveLength(3);
    expect(result.plano.periodos.reduce((a, p) => a + p.itens.length, 0)).toBe(7);
    expect(result.plano.metaHidratacao.aguaMl).toBe(3000);
    expect(result.plano.metaCardioMin).toBe(40);
    expect(result.treinoSplit).toBe("ABCDE");
    expect(result.closeoutTime).toBe("21:00");
    const jantar = result.plano.periodos.find((p) => p.nome === "Jantar")!;
    expect(jantar.itens.map((i) => i.nome)).toEqual(["Carne", "Salada"]);
  });

  it("converte saída do parser para o modelo de revisão da IA", () => {
    const converted = parserResultToAiPlan(parseCoachPlan(EXTRACTED));
    expect(converted.source).toBe("paste_parser");
    expect(converted.mealPeriods).toHaveLength(3);
    expect(converted.waterTargetMl).toBe(3000);
    expect(converted.cardioTargetMin).toBe(40);
    expect(converted.trainingSplit).toBe("ABCDE");
    expect(converted.closeoutTime).toBe("21:00");
    // Round-trip: revisão → ativação produz Plano válido.
    const { plano } = aiPlanToPlano(converted);
    expect(plano.periodos.reduce((a, p) => a + p.itens.length, 0)).toBe(7);
  });
});
