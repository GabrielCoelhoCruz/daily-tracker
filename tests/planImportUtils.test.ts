import { parseCoachPlan } from "@/utils/planImportUtils";

const SAMPLE = `
Plano do Coach - Prep 2026

Jejum:
- Cafeína 220mg
- Ioimbina 10mg

Refeição 1:
- Ovos inteiros - 3 unidades
- Whey isolado - 30g
- Aveia (40g)

Almoço:
- Frango grelhado 150g
- Arroz branco - 100g

Pré-treino:
- Cafeína 200mg

Jantar:
- Tilápia 180g

Água 4L
Chá 500ml
Cardio 90 min
`;

describe("parseCoachPlan", () => {
  it("estrutura períodos a partir de cabeçalhos conhecidos", () => {
    const { plano } = parseCoachPlan(SAMPLE, "Prep 2026");
    const nomes = plano.periodos.map((p) => p.nome);
    expect(nomes).toEqual([
      "Jejum",
      "Refeição 1",
      "Almoço",
      "Pré-treino",
      "Jantar",
    ]);
  });

  it("extrai itens com dosagem em vários formatos", () => {
    const { plano } = parseCoachPlan(SAMPLE);
    const ref1 = plano.periodos.find((p) => p.nome === "Refeição 1")!;
    expect(ref1.itens).toHaveLength(3);
    expect(ref1.itens[0]).toMatchObject({
      nome: "Ovos inteiros",
      dosagem: "3 unidades",
    });
    expect(ref1.itens[1]).toMatchObject({
      nome: "Whey isolado",
      dosagem: "30g",
    });
    expect(ref1.itens[2]).toMatchObject({ nome: "Aveia", dosagem: "40g" });
  });

  it("classifica categorias por heurística", () => {
    const { plano } = parseCoachPlan(SAMPLE);
    const jejum = plano.periodos.find((p) => p.nome === "Jejum")!;
    expect(jejum.itens[0].categoria).toBe("suplemento");
    const almoco = plano.periodos.find((p) => p.nome === "Almoço")!;
    expect(almoco.itens[0].categoria).toBe("refeicao");
  });

  it("extrai metas de água, chá e cardio", () => {
    const { plano } = parseCoachPlan(SAMPLE);
    expect(plano.metaHidratacao.aguaMl).toBe(4000);
    expect(plano.metaHidratacao.chaMl).toBe(500);
    expect(plano.metaCardioMin).toBe(90);
  });

  it("usa nome customizado e gera ids únicos", () => {
    const { plano } = parseCoachPlan(SAMPLE, "Meu plano");
    expect(plano.nome).toBe("Meu plano");
    const ids = plano.periodos.flatMap((p) => p.itens.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("agrupa itens sem cabeçalho em 'Dia todo'", () => {
    const { plano } = parseCoachPlan("- Creatina 5g\n- Ômega 3 - 2 caps");
    expect(plano.periodos).toHaveLength(1);
    expect(plano.periodos[0].nome).toBe("Dia todo");
    expect(plano.periodos[0].itens).toHaveLength(2);
  });

  it("avisa quando nada é reconhecido e quando metas faltam", () => {
    const empty = parseCoachPlan("");
    expect(empty.plano.periodos).toHaveLength(0);
    expect(empty.warnings.length).toBeGreaterThanOrEqual(1);

    const semMetas = parseCoachPlan("Almoço:\n- Frango 150g");
    expect(
      semMetas.warnings.some((w) => w.includes("água") || w.includes("Água"))
    ).toBe(true);
    expect(semMetas.plano.metaHidratacao.aguaMl).toBe(3000);
  });

  it("água em ml não é convertida", () => {
    const { plano } = parseCoachPlan("Água 3500ml\nAlmoço:\n- Frango 150g");
    expect(plano.metaHidratacao.aguaMl).toBe(3500);
  });

  it("reconhece formato inline 'Período: itens' estilo WhatsApp", () => {
    const INLINE = [
      "Café: ovos + aveia",
      "Almoço: arroz + frango + legumes",
      "Jantar: carne + salada",
      "Água: 3000 ml",
      "Cardio: 30 min",
      "Treino: ABCDE",
      "Fechamento do dia: 21:00",
    ].join("\n");
    const { plano } = parseCoachPlan(INLINE);
    expect(plano.periodos.map((p) => p.nome)).toEqual([
      "Café da manhã",
      "Almoço",
      "Jantar",
    ]);
    expect(plano.periodos[0].itens.map((i) => i.nome)).toEqual([
      "ovos",
      "aveia",
    ]);
    expect(plano.periodos[1].itens).toHaveLength(3);
    expect(plano.periodos[2].itens.map((i) => i.nome)).toEqual([
      "carne",
      "salada",
    ]);
    expect(plano.metaHidratacao.aguaMl).toBe(3000);
    expect(plano.metaCardioMin).toBe(30);
    // Linhas de treino/fechamento não viram itens de refeição.
    const allItems = plano.periodos.flatMap((p) => p.itens.map((i) => i.nome));
    expect(allItems.some((n) => /treino|fechamento/i.test(n))).toBe(false);
  });
});
