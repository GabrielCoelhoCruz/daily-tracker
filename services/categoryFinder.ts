// ─── Types ───────────────────────────────────────────────────────────────────

export type CategoryFinderInput = {
  gender: "male" | "female";
  heightCm: number;
  currentWeightKg: number;
};

export type CategoryResult = {
  name: string;
  className: string;
  eligible: boolean;
  maxWeightKg: number | null;
  deltaKg: number | null; // positive = needs to cut, negative = has margin
  status: "✅" | "⚠️" | "❌";
  statusText: string;
};

type MusculatureLevel =
  | "leve"
  | "leve-moderado"
  | "moderado"
  | "moderado-alto"
  | "alto"
  | "extremo";
type ConditioningLevel =
  | "moderado"
  | "moderado-definido"
  | "definido"
  | "definido-seco"
  | "seco"
  | "extremo";

export type CategoryMetadata = {
  name: string;
  classes: { label: string; maxHeight?: number; maxWeightKg?: number }[];
  poses: string[];
  attire: string;
  judgingCriteria: string[];
  musculatureLevel: MusculatureLevel;
  conditioningLevel: ConditioningLevel;
  summary: string;
};

// ─── Male Category Metadata ─────────────────────────────────────────────────

export const MALE_CATEGORIES: CategoryMetadata[] = [
  {
    name: "Men's Physique",
    classes: [
      { label: "A", maxHeight: 170 },
      { label: "B", maxHeight: 173 },
      { label: "C", maxHeight: 176 },
      { label: "D", maxHeight: 179 },
      { label: "E", maxHeight: 182 },
      { label: "F" },
    ],
    poses: [
      "Frontal relaxado",
      "Quarter turn direita",
      "Costas",
      "Quarter turn direita",
    ],
    attire: "Board shorts (1\" abaixo do umbigo, acima do joelho), descalço",
    judgingCriteria: [
      "V-taper — relação ombro-cintura é O critério principal",
      "Shape e simetria — físico atlético, esteticamente agradável",
      "Musculatura moderada — desenvolvido mas NÃO excessivo",
      "Condicionamento — abdômen visível, tônus, pele saudável",
      "Stage presence — confiança, personalidade, poise",
    ],
    musculatureLevel: "moderado",
    conditioningLevel: "moderado-definido",
    summary:
      "Pra quem quer um físico de praia elevado — atlético, simétrico, sem ser bodybuilder",
  },
  {
    name: "Muscular Men's Physique",
    classes: [{ label: "Open" }],
    poses: [
      "Frontal relaxado",
      "Quarter turn direita",
      "Costas",
      "Quarter turn direita",
    ],
    attire: "Board shorts, descalço",
    judgingCriteria: [
      "V-taper — relação ombro-cintura",
      "Shape e simetria — atlético, esteticamente agradável",
      "Musculatura moderado-alta — aceita mais que Physique regular",
      "Condicionamento — abdômen visível, tônus, pele saudável",
      "Stage presence — confiança, personalidade, poise",
    ],
    musculatureLevel: "moderado-alto",
    conditioningLevel: "moderado-definido",
    summary:
      "Pra quem está muscular demais pra Physique regular mas não quer ir pra Classic",
  },
  {
    name: "Classic Physique",
    classes: [
      { label: "A", maxHeight: 168 },
      { label: "B", maxHeight: 171 },
      { label: "C", maxHeight: 175 },
      { label: "D", maxHeight: 180 },
      { label: "E" },
    ],
    poses: [
      "Front Double Biceps",
      "Side Chest",
      "Back Double Biceps",
      "Abdominals and Thighs",
      "Favorite Classic Pose",
      "Vacuum Pose",
    ],
    attire: "Shorts preto estilo retrô, mínimo 15cm nas laterais",
    judgingCriteria: [
      "Estética Golden Era — visual anos 60-80, músculos arredondados, cintura fina",
      "Vacuum — pose DECISIVA, controle abdominal",
      "V-shape e proporção — simetria esquerdo/direito, upper/lower",
      "Condicionamento — bom mas NÃO excessivamente seco",
      "Posing artístico — transições suaves, fluidez, presença de palco",
    ],
    musculatureLevel: "alto",
    conditioningLevel: "definido-seco",
    summary:
      "Pra quem quer o visual de Arnold/Zane — massa muscular com cintura fina e posing artístico",
  },
  {
    name: "Classic Bodybuilding",
    classes: [
      { label: "A", maxHeight: 168 },
      { label: "B", maxHeight: 171 },
      { label: "C", maxHeight: 175 },
      { label: "D", maxHeight: 180 },
      { label: "E" },
    ],
    poses: [
      "Comparações (R1)",
      "Rotina livre com música (R2)",
      "Comparações (R3)",
    ],
    attire: "Posing sunga/trunks",
    judgingCriteria: [
      "Linhas corporais e proporção",
      "Posing artístico com rotina musical",
      "Musculatura moderado-alta — menos que Classic Physique",
      "Condicionamento definido-seco",
      "Simetria e equilíbrio geral",
    ],
    musculatureLevel: "moderado-alto",
    conditioningLevel: "definido-seco",
    summary:
      "Classic Physique com menos massa — mais ênfase em linhas e rotina artística",
  },
  {
    name: "Bodybuilding (IFBB)",
    classes: [
      { label: "Bantamweight", maxHeight: 165 },
      { label: "Lightweight", maxHeight: 170 },
      { label: "Middleweight", maxHeight: 175 },
      { label: "Light-Heavyweight", maxHeight: 180 },
      { label: "Heavyweight", maxHeight: 190 },
      { label: "Super-Heavyweight" },
    ],
    poses: [
      "Front Double Biceps",
      "Front Lat Spread",
      "Side Chest",
      "Back Double Biceps",
      "Back Lat Spread",
      "Side Triceps",
      "Abdominals and Thighs",
      "Most Muscular",
    ],
    attire: "Posing sunga/trunks",
    judgingCriteria: [
      "Tamanho muscular — desenvolvimento máximo de todos os grupos",
      "Definição e separação — estriações, vascularidade visível",
      "Proporção e simetria — equilíbrio esquerdo/direito, upper/lower",
      "Condicionamento — o mais seco possível, grainy, paper thin skin",
      "Posing e apresentação — rotina com música, transições, expressão",
    ],
    musculatureLevel: "extremo",
    conditioningLevel: "extremo",
    summary:
      "Pra quem quer levar massa e definição ao máximo absoluto",
  },
  {
    name: "Bodybuilding (NPC)",
    classes: [
      { label: "Bantamweight", maxWeightKg: 64.9 },
      { label: "Lightweight", maxWeightKg: 69.9 },
      { label: "Middleweight", maxWeightKg: 79.8 },
      { label: "Light-Heavyweight", maxWeightKg: 89.8 },
      { label: "Heavyweight", maxWeightKg: 102.1 },
      { label: "Super-Heavyweight" },
    ],
    poses: [
      "Front Double Biceps",
      "Front Lat Spread",
      "Side Chest",
      "Back Double Biceps",
      "Back Lat Spread",
      "Side Triceps",
      "Abdominals and Thighs",
      "Most Muscular",
    ],
    attire: "Posing sunga/trunks",
    judgingCriteria: [
      "Tamanho muscular — desenvolvimento máximo de todos os grupos",
      "Definição e separação — estriações, vascularidade visível",
      "Proporção e simetria — equilíbrio esquerdo/direito, upper/lower",
      "Condicionamento — o mais seco possível, grainy, paper thin skin",
      "Posing e apresentação — rotina com música, transições, expressão",
    ],
    musculatureLevel: "extremo",
    conditioningLevel: "extremo",
    summary:
      "Pra quem quer levar massa e definição ao máximo absoluto",
  },
];

// ─── Female Category Metadata ───────────────────────────────────────────────

export const FEMALE_CATEGORIES: CategoryMetadata[] = [
  {
    name: "Women's Bikini",
    classes: [
      { label: "A", maxHeight: 158 },
      { label: "B", maxHeight: 160 },
      { label: "C", maxHeight: 162 },
      { label: "D", maxHeight: 164 },
      { label: "E", maxHeight: 166 },
      { label: "F", maxHeight: 169 },
      { label: "G", maxHeight: 172 },
      { label: "H" },
    ],
    poses: [
      "Front Pose",
      "Quarter turn direita",
      "Back Pose",
      "Quarter turn direita",
    ],
    attire: "Biquíni duas peças (V-shape, sem fio dental), salto alto",
    judgingCriteria: [
      "Shape — silhueta ampulheta: ombros arredondados, cintura fina, glúteos definidos",
      "Balance e simetria — proporção entre upper e lower body",
      "Tônus — músculos com forma mas SEM separação, estriações ou secura",
      "Pele, cabelo, maquiagem — Total Package, pele lisa e saudável",
      "Apresentação — confiança, poise, graça, feminilidade",
    ],
    musculatureLevel: "leve-moderado",
    conditioningLevel: "moderado",
    summary:
      "Pra quem quer um físico saudável e fit com ênfase em shape, feminilidade e apresentação",
  },
  {
    name: "Women's Wellness",
    classes: [
      { label: "A", maxHeight: 158 },
      { label: "B", maxHeight: 163 },
      { label: "C", maxHeight: 168 },
      { label: "D" },
    ],
    poses: [
      "Front pose (mão no quadril, perna estendida)",
      "Quarter turn direita",
      "Costas (arco lombar, glúteos projetados)",
      "Quarter turn direita",
    ],
    attire: "Biquíni duas peças + salto alto",
    judgingCriteria: [
      "Lower body dominante — coxas, glúteos e quadris MAIS desenvolvidos que upper body",
      "Balance vertical — proporção pernas vs tronco favorece lower body",
      "Shape e contorno — atlético e esteticamente agradável, sem separação extrema",
      "Upper body proporcional — desenvolvido mas NÃO no mesmo grau que lower",
      "Apresentação — pele, poise, confiança, Total Package",
    ],
    musculatureLevel: "moderado",
    conditioningLevel: "moderado",
    summary:
      "Pra quem tem lower body naturalmente mais desenvolvido — coxas, glúteos e quadris são protagonistas",
  },
  {
    name: "Women's Figure",
    classes: [
      { label: "A", maxHeight: 158 },
      { label: "B", maxHeight: 163 },
      { label: "C", maxHeight: 168 },
      { label: "D" },
    ],
    poses: [
      "Front Pose",
      "Quarter turn direita",
      "Back Pose",
      "Quarter turn direita",
    ],
    attire: "Figure suit (duas peças, corte mais alto) + salto alto",
    judgingCriteria: [
      "X-frame — ombros e costas desenvolvidos + cintura fina + quads e glúteos formados",
      "Separação muscular — visível MAS sem estriações",
      "Simetria e proporção — equilíbrio entre todos os grupos musculares",
      "Condicionamento — mais definida que Bikini/Wellness",
      "Apresentação e confiança",
    ],
    musculatureLevel: "moderado-alto",
    conditioningLevel: "definido",
    summary:
      "Blend de bodybuilding e fitness — mais muscular que Bikini/Wellness, X-frame com separação visível",
  },
  {
    name: "Women's Physique",
    classes: [{ label: "A", maxHeight: 163 }, { label: "B" }],
    poses: [
      "Front Double Biceps",
      "Side Chest com braço estendido",
      "Side Triceps",
      "Back Double Biceps",
    ],
    attire: "Posing suit (duas peças)",
    judgingCriteria: [
      "Físico tonificado e atlético com feminilidade mantida",
      "Musculatura visível — separação e alguma estriação aceitas",
      "Musculatura EXCESSIVA ainda é penalizada (não é bodybuilding)",
      "Beauty flow — como a musculatura flui de um grupo ao outro",
      "Rotina com música — personalidade, confiança, controle muscular",
    ],
    musculatureLevel: "alto",
    conditioningLevel: "definido-seco",
    summary:
      "Pra quem quer mostrar músculos de verdade com feminilidade — separação visível, poses, rotina",
  },
  {
    name: "Women's Bodybuilding",
    classes: [
      { label: "Lightweight", maxWeightKg: 52.2 },
      { label: "Middleweight", maxWeightKg: 56.7 },
      { label: "Light-Heavyweight", maxWeightKg: 63.5 },
      { label: "Heavyweight" },
    ],
    poses: [
      "Front Double Biceps",
      "Front Lat Spread",
      "Side Chest",
      "Back Double Biceps",
      "Back Lat Spread",
      "Side Triceps",
      "Abdominals and Thighs",
      "Most Muscular",
    ],
    attire: "Posing suit (duas peças)",
    judgingCriteria: [
      "Desenvolvimento muscular máximo",
      "Definição extrema e separação",
      "Simetria e proporção",
      "Condicionamento no limite",
      "Rotina livre 90s com música",
    ],
    musculatureLevel: "extremo",
    conditioningLevel: "extremo",
    summary:
      "O nível máximo de desenvolvimento muscular feminino — sem limite de tamanho, definição total",
  },
  {
    name: "Women's Bodyfitness",
    classes: [
      { label: "A", maxHeight: 158 },
      { label: "B", maxHeight: 163 },
      { label: "C", maxHeight: 168 },
      { label: "D" },
    ],
    poses: ["Quarter turns", "I-walking na final"],
    attire: "Biquíni estilo livre + salto alto",
    judgingCriteria: [
      "Aparência atlética e simetria",
      "Tônus muscular e shape",
      "Pouca gordura corporal",
      "Cabelo, maquiagem, estilo pessoal",
      "Posicionada entre Bikini e Figure",
    ],
    musculatureLevel: "moderado",
    conditioningLevel: "moderado-definido",
    summary:
      "Atlética e simétrica com estilo pessoal — mais tônus que Bikini, menos separação que Figure",
  },
  {
    name: "Women's Fit Model",
    classes: [
      { label: "A", maxHeight: 158 },
      { label: "B", maxHeight: 162 },
      { label: "C", maxHeight: 166 },
      { label: "D", maxHeight: 169 },
      { label: "E", maxHeight: 172 },
      { label: "F" },
    ],
    poses: ["Apresentação", "Passarela"],
    attire: "Vestido de gala + traje de banho (2 rounds)",
    judgingCriteria: [
      "Nem excessivamente muscular nem excessivamente magra",
      "Equilibrada, proporcional, simétrica",
      "Pele, cabelo, beleza facial",
      "Confiança e graça",
      "Total Package = fitness + estilo + personalidade",
    ],
    musculatureLevel: "leve",
    conditioningLevel: "moderado",
    summary:
      "Modelo fitness — ênfase em beleza, equilíbrio e apresentação, não em musculatura",
  },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

function computeWeightStatus(
  currentWeightKg: number,
  maxWeightKg: number
): Pick<CategoryResult, "eligible" | "deltaKg" | "status" | "statusText"> {
  const delta = currentWeightKg - maxWeightKg;
  if (delta <= 0) {
    return {
      eligible: true,
      deltaKg: delta,
      status: "✅",
      statusText: `Elegível — ${Math.abs(delta).toFixed(1)}kg de margem`,
    };
  }
  return {
    eligible: false,
    deltaKg: delta,
    status: delta <= 5 ? "⚠️" : "❌",
    statusText: `Precisa cortar ${delta.toFixed(1)}kg (máx ${maxWeightKg}kg)`,
  };
}

function findClassByHeight(
  classes: { label: string; maxHeight?: number }[],
  heightCm: number
): { label: string; maxHeight?: number } {
  return classes.find((c) => !c.maxHeight || heightCm <= c.maxHeight)!;
}

function findClassByWeight(
  classes: { label: string; maxWeightKg?: number }[],
  weightKg: number
): { label: string; maxWeightKg?: number } {
  return classes.find((c) => !c.maxWeightKg || weightKg <= c.maxWeightKg)!;
}

function formatHeightClass(cls: { label: string; maxHeight?: number }): string {
  return cls.maxHeight
    ? `Class ${cls.label} (≤${cls.maxHeight}cm)`
    : `Class ${cls.label} (>${LAST_HEIGHT_THRESHOLDS[cls.label] ?? ""}cm)`;
}

// Last height thresholds for the "open" class labels
const LAST_HEIGHT_THRESHOLDS: Record<string, number> = {
  F: 182, // Men's Physique
  E: 180, // Classic Physique / Classic BB
  "Super-Heavyweight": 190, // BB IFBB
  H: 172, // Bikini
  D: 168, // Wellness/Figure/Bodyfitness
  B: 163, // Women's Physique
};

function noWeightLimitResult(name: string, className: string): CategoryResult {
  return {
    name,
    className,
    eligible: true,
    maxWeightKg: null,
    deltaKg: null,
    status: "✅",
    statusText: "Elegível — sem limite de peso",
  };
}

// ─── Main function ───────────────────────────────────────────────────────────

const CP_BONUSES = [
  { maxH: 168, bonus: 4, label: "A" },
  { maxH: 171, bonus: 6, label: "B" },
  { maxH: 175, bonus: 8, label: "C" },
  { maxH: 180, bonus: 11, label: "D" },
  { maxH: Infinity, bonus: 13, label: "E" },
];

const CB_BONUSES = [
  { maxH: 168, bonus: 2, label: "A" },
  { maxH: 171, bonus: 4, label: "B" },
  { maxH: 175, bonus: 6, label: "C" },
  { maxH: 180, bonus: 8, label: "D" },
  { maxH: Infinity, bonus: 10, label: "E" },
];

export function findCategories(input: CategoryFinderInput): CategoryResult[] {
  const { gender, heightCm, currentWeightKg } = input;
  const results: CategoryResult[] = [];

  if (gender === "male") {
    // Men's Physique — height classes, no weight limit
    const mpClasses = [
      { label: "A", max: 170 },
      { label: "B", max: 173 },
      { label: "C", max: 176 },
      { label: "D", max: 179 },
      { label: "E", max: 182 },
      { label: "F", max: Infinity },
    ];
    const mp = mpClasses.find((c) => heightCm <= c.max)!;
    results.push(
      noWeightLimitResult(
        "Men's Physique",
        mp.max === Infinity
          ? `Class ${mp.label} (>182cm)`
          : `Class ${mp.label} (≤${mp.max}cm)`
      )
    );

    // Muscular Men's Physique — Open, no weight limit
    results.push(noWeightLimitResult("Muscular Men's Physique", "Open"));

    // Classic Physique — formula: (height-100) + bonus
    const cp = CP_BONUSES.find((c) => heightCm <= c.maxH)!;
    const cpMax = heightCm - 100 + cp.bonus;
    results.push({
      name: "Classic Physique",
      className:
        cp.maxH === Infinity
          ? `Class ${cp.label} (>180cm)`
          : `Class ${cp.label} (≤${cp.maxH}cm)`,
      maxWeightKg: cpMax,
      ...computeWeightStatus(currentWeightKg, cpMax),
    });

    // Classic Bodybuilding — formula: (height-100) + bonus (lower)
    const cb = CB_BONUSES.find((c) => heightCm <= c.maxH)!;
    const cbMax = heightCm - 100 + cb.bonus;
    results.push({
      name: "Classic Bodybuilding",
      className:
        cb.maxH === Infinity
          ? `Class ${cb.label} (>180cm)`
          : `Class ${cb.label} (≤${cb.maxH}cm)`,
      maxWeightKg: cbMax,
      ...computeWeightStatus(currentWeightKg, cbMax),
    });

    // Bodybuilding IFBB — by height, no weight limit
    const bbClasses = [
      { label: "Bantamweight", max: 165 },
      { label: "Lightweight", max: 170 },
      { label: "Middleweight", max: 175 },
      { label: "Light-Heavyweight", max: 180 },
      { label: "Heavyweight", max: 190 },
      { label: "Super-Heavyweight", max: Infinity },
    ];
    const bb = bbClasses.find((c) => heightCm <= c.max)!;
    results.push(
      noWeightLimitResult(
        "Bodybuilding (IFBB)",
        bb.max === Infinity
          ? `${bb.label} (>190cm)`
          : `${bb.label} (≤${bb.max}cm)`
      )
    );

    // Bodybuilding NPC — by weight
    const npcClasses = [
      { label: "Bantamweight", max: 64.9 },
      { label: "Lightweight", max: 69.9 },
      { label: "Middleweight", max: 79.8 },
      { label: "Light-Heavyweight", max: 89.8 },
      { label: "Heavyweight", max: 102.1 },
      { label: "Super-Heavyweight", max: Infinity },
    ];
    const npc = npcClasses.find((c) => currentWeightKg <= c.max)!;
    results.push(
      noWeightLimitResult(
        "Bodybuilding (NPC)",
        npc.max === Infinity
          ? `${npc.label} (>102.1kg)`
          : `${npc.label} (≤${npc.max}kg)`
      )
    );
  }

  if (gender === "female") {
    // Women's Bikini — height classes, no weight limit
    const bikiniClasses = [
      { label: "A", max: 158 },
      { label: "B", max: 160 },
      { label: "C", max: 162 },
      { label: "D", max: 164 },
      { label: "E", max: 166 },
      { label: "F", max: 169 },
      { label: "G", max: 172 },
      { label: "H", max: Infinity },
    ];
    const bk = bikiniClasses.find((c) => heightCm <= c.max)!;
    results.push(
      noWeightLimitResult(
        "Women's Bikini",
        bk.max === Infinity
          ? `Class ${bk.label} (>172cm)`
          : `Class ${bk.label} (≤${bk.max}cm)`
      )
    );

    // Women's Wellness
    const wellnessClasses = [
      { label: "A", max: 158 },
      { label: "B", max: 163 },
      { label: "C", max: 168 },
      { label: "D", max: Infinity },
    ];
    const wl = wellnessClasses.find((c) => heightCm <= c.max)!;
    results.push(
      noWeightLimitResult(
        "Women's Wellness",
        wl.max === Infinity
          ? `Class ${wl.label} (>168cm)`
          : `Class ${wl.label} (≤${wl.max}cm)`
      )
    );

    // Women's Figure
    const figureClasses = [
      { label: "A", max: 158 },
      { label: "B", max: 163 },
      { label: "C", max: 168 },
      { label: "D", max: Infinity },
    ];
    const fg = figureClasses.find((c) => heightCm <= c.max)!;
    results.push(
      noWeightLimitResult(
        "Women's Figure",
        fg.max === Infinity
          ? `Class ${fg.label} (>168cm)`
          : `Class ${fg.label} (≤${fg.max}cm)`
      )
    );

    // Women's Physique
    const wpClasses = [
      { label: "A", max: 163 },
      { label: "B", max: Infinity },
    ];
    const wp = wpClasses.find((c) => heightCm <= c.max)!;
    results.push(
      noWeightLimitResult(
        "Women's Physique",
        wp.max === Infinity
          ? `Class ${wp.label} (>163cm)`
          : `Class ${wp.label} (≤${wp.max}cm)`
      )
    );

    // Women's Bodybuilding — NPC by weight
    const wbbClasses = [
      { label: "Lightweight", max: 52.2 },
      { label: "Middleweight", max: 56.7 },
      { label: "Light-Heavyweight", max: 63.5 },
      { label: "Heavyweight", max: Infinity },
    ];
    const wbb = wbbClasses.find((c) => currentWeightKg <= c.max)!;
    results.push(
      noWeightLimitResult(
        "Women's Bodybuilding",
        wbb.max === Infinity
          ? `${wbb.label} (>63.5kg)`
          : `${wbb.label} (≤${wbb.max}kg)`
      )
    );

    // Women's Bodyfitness
    const bfClasses = [
      { label: "A", max: 158 },
      { label: "B", max: 163 },
      { label: "C", max: 168 },
      { label: "D", max: Infinity },
    ];
    const bf = bfClasses.find((c) => heightCm <= c.max)!;
    results.push(
      noWeightLimitResult(
        "Women's Bodyfitness",
        bf.max === Infinity
          ? `Class ${bf.label} (>168cm)`
          : `Class ${bf.label} (≤${bf.max}cm)`
      )
    );

    // Women's Fit Model
    const fmClasses = [
      { label: "A", max: 158 },
      { label: "B", max: 162 },
      { label: "C", max: 166 },
      { label: "D", max: 169 },
      { label: "E", max: 172 },
      { label: "F", max: Infinity },
    ];
    const fm = fmClasses.find((c) => heightCm <= c.max)!;
    results.push(
      noWeightLimitResult(
        "Women's Fit Model",
        fm.max === Infinity
          ? `Class ${fm.label} (>172cm)`
          : `Class ${fm.label} (≤${fm.max}cm)`
      )
    );
  }

  return results;
}
