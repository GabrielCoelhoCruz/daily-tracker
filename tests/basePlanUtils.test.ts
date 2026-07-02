import { buildBasePlan, suggestMealNames } from "@/utils/basePlanUtils";

describe("suggestMealNames", () => {
  it("returns defaults for 3–6 meals", () => {
    expect(suggestMealNames(3)).toEqual(["Café", "Almoço", "Jantar"]);
    expect(suggestMealNames(4)).toEqual([
      "Café",
      "Almoço",
      "Pré/Pós-treino",
      "Jantar",
    ]);
    expect(suggestMealNames(5)).toHaveLength(5);
    expect(suggestMealNames(6)).toHaveLength(6);
  });

  it("falls back to generic names outside 3–6", () => {
    expect(suggestMealNames(2)).toEqual(["Refeição 1", "Refeição 2"]);
    expect(suggestMealNames(7)).toHaveLength(7);
  });
});

describe("buildBasePlan", () => {
  it("creates one period per meal with a single simple item", () => {
    const plan = buildBasePlan({
      mealNames: ["Café", "Almoço", "Jantar"],
      aguaMl: 3000,
      cardioMin: 30,
    });

    expect(plan.nome).toBe("Plano-base manual");
    expect(plan.periodos).toHaveLength(3);
    expect(plan.periodos[0].nome).toBe("Café");
    expect(plan.periodos[0].itens).toHaveLength(1);
    expect(plan.periodos[0].itens[0].categoria).toBe("refeicao");
    expect(plan.metaHidratacao.aguaMl).toBe(3000);
    expect(plan.metaCardioMin).toBe(30);
  });

  it("skips empty meal names and generates unique ids", () => {
    const plan = buildBasePlan({
      mealNames: ["Café", "", "  ", "Café"],
      aguaMl: 2000,
      cardioMin: 0,
    });

    expect(plan.periodos).toHaveLength(2);
    const ids = plan.periodos.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("supports the coach 'Começar simples' path via planName (coach_import label)", () => {
    const plan = buildBasePlan({
      mealNames: suggestMealNames(5),
      aguaMl: 3000,
      cardioMin: 30,
      planName: "Plano do coach (simples)",
    });

    expect(plan.nome).toBe("Plano do coach (simples)");
    expect(plan.periodos).toHaveLength(5);
    expect(
      plan.periodos.every((p) =>
        p.itens.some((i) => i.categoria === "refeicao"),
      ),
    ).toBe(true);
  });

  it("clamps negative targets to zero", () => {
    const plan = buildBasePlan({
      mealNames: ["Café"],
      aguaMl: -100,
      cardioMin: -5,
    });
    expect(plan.metaHidratacao.aguaMl).toBe(0);
    expect(plan.metaCardioMin).toBe(0);
  });
});
