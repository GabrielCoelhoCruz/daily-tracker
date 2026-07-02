import type { Periodo, Plano } from "@/data/plano";

/**
 * Gerador do plano-base manual (fluxo "Estou sem coach").
 * Converte metas simples escolhidas no onboarding em um Plano executável,
 * sem banco de alimentos e sem cálculo de calorias/macros.
 */

export type BasePlanConfig = {
  mealNames: string[];
  aguaMl: number;
  cardioMin: number;
  planName?: string;
};

/** Sugestões de refeições por quantidade escolhida (3–6). */
export function suggestMealNames(count: number): string[] {
  switch (count) {
    case 3:
      return ["Café", "Almoço", "Jantar"];
    case 4:
      return ["Café", "Almoço", "Pré/Pós-treino", "Jantar"];
    case 5:
      return ["Café", "Almoço", "Pré-treino", "Pós-treino", "Jantar"];
    case 6:
      return ["Café", "Lanche", "Almoço", "Pré-treino", "Pós-treino", "Jantar/Ceia"];
    default: {
      const clamped = Math.max(1, Math.min(8, Math.round(count) || 3));
      return Array.from({ length: clamped }, (_, i) => `Refeição ${i + 1}`);
    }
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function buildBasePlan(config: BasePlanConfig): Plano {
  const usedIds = new Set<string>();

  const periodos: Periodo[] = config.mealNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name, index) => {
      let id = slugify(name) || `refeicao-${index + 1}`;
      while (usedIds.has(id)) id = `${id}-${index + 1}`;
      usedIds.add(id);
      return {
        id,
        nome: name,
        itens: [
          {
            id: `${id}-refeicao`,
            nome: name,
            categoria: "refeicao" as const,
          },
        ],
      };
    });

  return {
    nome: config.planName?.trim() || "Plano-base manual",
    descricao: `Criado em ${new Date().toLocaleDateString("pt-BR")}`,
    periodos,
    metaHidratacao: {
      aguaMl: Math.max(0, Math.round(config.aguaMl) || 0),
      chaMl: 0,
    },
    metaCardioMin: Math.max(0, Math.round(config.cardioMin) || 0),
  };
}
