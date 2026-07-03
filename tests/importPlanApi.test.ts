import { buildParserFallback } from "@/app/api/import-plan+api";

const EXTRACTED_PLAN = `
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

describe("import-plan API parser fallback", () => {
  it("converte texto extraido do PDF em plano revisavel quando a IA falha", () => {
    const fallback = buildParserFallback(EXTRACTED_PLAN);

    expect(fallback).not.toBeNull();
    expect(fallback!.source).toBe("paste_parser");
    expect(fallback!.mealPeriods).toHaveLength(3);
    expect(fallback!.mealPeriods.reduce((sum, period) => sum + period.items.length, 0)).toBe(7);
    expect(fallback!.waterTargetMl).toBe(3000);
    expect(fallback!.cardioTargetMin).toBe(40);
    expect(fallback!.trainingSplit).toBe("ABCDE");
    expect(fallback!.closeoutTime).toBe("21:00");
    expect(fallback!.rawTextPreview).toBe(EXTRACTED_PLAN.slice(0, 400));
  });

  it("retorna null quando o parser offline nao encontra itens", () => {
    expect(buildParserFallback("Plano sem estrutura suficiente")).toBeNull();
  });
});
