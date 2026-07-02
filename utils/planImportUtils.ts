import type { Categoria, ItemDoPlano, Periodo, Plano } from "@/data/plano";

/**
 * Parser heurístico do fluxo "Colar plano do coach" (design system v1.1 §9).
 * Recebe texto livre (WhatsApp, notas do coach) e estrutura em Plano.
 * Offline-first: nenhuma chamada de rede.
 */

const PERIOD_KEYWORDS: { match: RegExp; nome: string }[] = [
  { match: /\bjejum\b/i, nome: "Jejum" },
  // Sem \b no fim: "é"/"ã" são non-word para o regex e quebrariam o boundary.
  { match: /(?:^|\s)(caf[eé] da manh[aã]|desjejum|caf[eé])(?=[\s:.,)]|$)/i, nome: "Café da manhã" },
  { match: /\balmo[cç]o\b/i, nome: "Almoço" },
  { match: /\bpr[eé][- ]?treino\b/i, nome: "Pré-treino" },
  { match: /\bintra[- ]?treino\b/i, nome: "Intra-treino" },
  { match: /\bp[oó]s[- ]?treino\b/i, nome: "Pós-treino" },
  { match: /\bjantar?\b/i, nome: "Jantar" },
  { match: /\bceia\b/i, nome: "Ceia" },
  { match: /\blanche( da tarde| da manh[aã])?\b/i, nome: "Lanche" },
  { match: /\brefei[cç][aã]o\s*(\d+)\b/i, nome: "Refeição" },
];

const SUPPLEMENT_HINTS =
  /\b(whey|creatina|cafe[ií]na|[oô]mega|multivitam|glutamina|bcaa|beta[- ]?alanina|vitamina|zma|magn[eé]sio|melatonina|termog|pre[- ]?workout|psyllium|ioimbina|carnitina|albumina|caseina|case[ií]na|hmb|arginina|citrulina|taurina|eletr[oó]lito)\b/i;

const CARDIO_HINTS = /\b(cardio|esteira|bike|escada|caminhada|corrida|liss|hiit)\b/i;

const DOSAGE_PATTERN =
  /(\d+(?:[.,]\d+)?\s*(?:g|mg|mcg|ml|kg|un|unidades?|caps?|c[aá]psulas?|scoops?|colheres?|fatias?|x)\b.*)$/i;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function detectPeriodName(line: string): string | null {
  const clean = line.replace(/[*_#>\-•]+/g, " ").trim();
  // Header shape: short line, ends with ":" or matches known period keyword
  const endsColon = /:\s*$/.test(clean);
  const short = clean.length <= 40;
  for (const { match, nome } of PERIOD_KEYWORDS) {
    const m = clean.match(match);
    if (m && (endsColon || short)) {
      if (nome === "Refeição") {
        const num = clean.match(/refei[cç][aã]o\s*(\d+)/i)?.[1];
        return num ? `Refeição ${num}` : "Refeição";
      }
      // Preserve time hint if present, e.g. "Almoço (12h)"
      const time = clean.match(/\(?\d{1,2}[:h]\d{0,2}\)?/)?.[0];
      return time ? `${nome} ${time.replace(/[()]/g, "")}`.trim() : nome;
    }
  }
  return null;
}

function detectCategoria(nome: string): Categoria {
  if (CARDIO_HINTS.test(nome)) return "cardio";
  if (SUPPLEMENT_HINTS.test(nome)) return "suplemento";
  return "refeicao";
}

function parseItem(line: string, periodoId: string, index: number): ItemDoPlano | null {
  const clean = line.replace(/^[\s*_>•·]*[-–—]?\s*/, "").trim();
  if (!clean || clean.length < 2) return null;

  // "Nome - dosagem" | "Nome: dosagem" | "Nome (dosagem)" | "Nome 150g"
  let nome = clean;
  let dosagem: string | undefined;

  const sep = clean.match(/^(.{2,}?)\s*[—–:\-]\s+(.+)$/);
  const paren = clean.match(/^(.{2,}?)\s*\((.+)\)\s*$/);
  const trailing = clean.match(DOSAGE_PATTERN);

  if (sep) {
    nome = sep[1].trim();
    dosagem = sep[2].trim();
  } else if (paren) {
    nome = paren[1].trim();
    dosagem = paren[2].trim();
  } else if (trailing && trailing.index !== undefined && trailing.index > 0) {
    nome = clean.slice(0, trailing.index).trim();
    dosagem = trailing[1].trim();
  }

  if (!nome) return null;

  return {
    id: `${periodoId}-${slugify(nome) || `item-${index}`}`,
    nome,
    dosagem,
    categoria: detectCategoria(nome),
  };
}

export type ParsedPlanResult = {
  plano: Plano;
  warnings: string[];
};

export function parseCoachPlan(rawText: string, planName?: string): ParsedPlanResult {
  const warnings: string[] = [];
  const lines = rawText.split(/\r?\n/);

  const periodos: Periodo[] = [];
  let current: Periodo | null = null;
  let aguaMl: number | undefined;
  let chaMl: number | undefined;
  let cardioMin: number | undefined;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Linhas com marcador de lista são sempre itens — nunca header ou meta.
    const isBullet = /^[-–—•*·]\s*/.test(line);

    // Metas
    const agua =
      !isBullet &&
      line.match(/[aá]gua\D*(\d+(?:[.,]\d+)?)\s*(l|litros?|ml)\b/i);
    if (agua) {
      const value = Number(agua[1].replace(",", "."));
      aguaMl = /^l/i.test(agua[2]) ? Math.round(value * 1000) : Math.round(value);
      continue;
    }
    const cha =
      !isBullet && line.match(/ch[aá]\D*(\d+(?:[.,]\d+)?)\s*(l|litros?|ml)\b/i);
    if (cha) {
      const value = Number(cha[1].replace(",", "."));
      chaMl = /^l/i.test(cha[2]) ? Math.round(value * 1000) : Math.round(value);
      continue;
    }
    const cardio =
      !isBullet && line.match(/cardio\D*(\d+)\s*(?:min|minutos?)\b/i);
    if (cardio) {
      cardioMin = Number(cardio[1]);
      continue;
    }

    // Linhas de treino/fechamento não são refeições — o split de treino e o
    // horário de fechamento são configurados em etapas próprias do onboarding.
    if (!isBullet && /^(treino|fechamento(\s+do\s+dia)?)\s*[:\-]/i.test(line)) {
      continue;
    }

    // Formato inline "Período: conteúdo" (comum no WhatsApp), por exemplo
    // "Café: ovos + aveia" — cria o período e aproveita o conteúdo como itens.
    const inline = !isBullet && line.match(/^([^:]{2,40}):\s*(.+)$/);
    if (inline) {
      const inlinePeriodName = detectPeriodName(`${inline[1]}:`);
      if (inlinePeriodName) {
        current = {
          id: slugify(inlinePeriodName) || `periodo-${periodos.length + 1}`,
          nome: inlinePeriodName,
          itens: [],
        };
        periodos.push(current);
        for (const frag of inline[2].split(/\s*[+;,]\s*/)) {
          const item = parseItem(frag, current.id, current.itens.length);
          if (item) current.itens.push(item);
        }
        continue;
      }
    }

    const periodName = isBullet ? null : detectPeriodName(line);
    if (periodName) {
      current = {
        id: slugify(periodName) || `periodo-${periodos.length + 1}`,
        nome: periodName,
        itens: [],
      };
      periodos.push(current);
      continue;
    }

    if (!current) {
      // Antes do primeiro header: linhas sem bullet são título/preâmbulo.
      if (!isBullet) continue;
      // Item com bullet antes de qualquer período → bucket "Dia todo".
      current = { id: "dia-todo", nome: "Dia todo", itens: [] };
      periodos.push(current);
    }
    const item = parseItem(line, current.id, current.itens.length);
    if (item) current.itens.push(item);
  }

  const nonEmpty = periodos.filter((p) => p.itens.length > 0);
  if (nonEmpty.length === 0) {
    warnings.push(
      "Nenhum período com itens foi reconhecido. Revise o texto colado."
    );
  }
  if (aguaMl === undefined) {
    warnings.push("Meta de água não encontrada — usando 3.000 ml.");
  }
  if (cardioMin === undefined) {
    warnings.push("Meta de cardio não encontrada — usando 0 min.");
  }

  return {
    plano: {
      nome: planName?.trim() || "Plano do coach",
      descricao: `Importado em ${new Date().toLocaleDateString("pt-BR")}`,
      periodos: nonEmpty,
      metaHidratacao: { aguaMl: aguaMl ?? 3000, chaMl: chaMl ?? 0 },
      metaCardioMin: cardioMin ?? 0,
    },
    warnings,
  };
}
