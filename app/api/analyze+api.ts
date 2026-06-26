type AthleteProfile = {
  name: string;
  gender: "male" | "female";
  heightCm: number;
  currentWeightKg: number;
  phase?: string;
  coachName?: string;
  competitiveExperience?: string;
};

type AnalyzeRequestBody = {
  photos: { base64: string; label: string }[];
  userPrompt: string;
  athleteProfile: AthleteProfile;
};

// ─── Rate limiting (basic in-memory) ──────────────────────────────────────────
const requestTimestamps: number[] = [];
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function isRateLimited(): boolean {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) return true;
  requestTimestamps.push(now);
  return false;
}

// ─── System prompt (built server-side, never sent from client) ────────────────

function buildMaleCategoriesReference(): string {
  return `### CATEGORIAS MASCULINAS

#### Men's Physique (IFBB)
Sem limite de peso. Classes por altura.
| Classe | Altura |
|--------|--------|
| A | ≤170cm |
| B | ≤173cm |
| C | ≤176cm |
| D | ≤179cm |
| E | ≤182cm |
| F | >182cm |
Attire: Board shorts (1" abaixo do umbigo, acima do joelho), descalço
Poses: Quarter turns (4) — Frontal relaxado → Quarter turn direita → Costas → Quarter turn direita
NÃO faz poses de bodybuilding (double biceps, lat spread, etc.)
Critérios (ordem de importância):
1. V-taper — relação ombro-cintura é O critério principal
2. Shape e simetria — físico atlético, esteticamente agradável
3. Musculatura moderada — desenvolvido mas NÃO excessivo. Musculatura excessiva é PENALIZADA
4. Condicionamento — abdômen visível, tônus, pele saudável. Sem estriações extremas
5. Stage presence — confiança, personalidade, poise, cabelo, pele
Musculatura: moderado | Condicionamento: moderado-definido

#### Muscular Men's Physique (IFBB)
Classe Open, todas as alturas, sem limite de peso.
Attire e poses: idênticos ao Men's Physique. Aceita musculatura LIGEIRAMENTE maior.
Musculatura: moderado-alto | Condicionamento: moderado-definido

#### Classic Physique (IFBB)
Limite de peso por altura: peso_maximo = (altura_cm - 100) + bonus
| Classe | Altura Máx | Bonus |
|--------|-----------|-------|
| A | ≤168cm | +4kg |
| B | ≤171cm | +6kg |
| C | ≤175cm | +8kg |
| D | ≤180cm | +11kg |
| E | >180cm | +13kg |
Attire: Shorts preto estilo retrô, mínimo 15cm nas laterais
Poses mandatórias (5+1): Front Double Biceps, Side Chest, Back Double Biceps, Abdominals and Thighs, Favorite Classic Pose, VACUUM POSE
Critérios:
1. Estética Golden Era — visual anos 60-80, músculos arredondados, cintura fina
2. Vacuum — pose DECISIVA. Distensão é penalizada pesadamente
3. V-shape e proporção — simetria esquerdo/direito, upper/lower
4. Condicionamento — bom mas NÃO excessivamente seco. Mais "cheio" que Open BB
5. Posing artístico — transições suaves, fluidez, presença de palco
Musculatura: alto | Condicionamento: definido-seco

#### Classic Bodybuilding (IFBB)
Limite de peso por altura (MENOR que Classic Physique): peso_maximo = (altura_cm - 100) + bonus
| Classe | Altura Máx | Bonus |
|--------|-----------|-------|
| A | ≤168cm | +2kg |
| B | ≤171cm | +4kg |
| C | ≤175cm | +6kg |
| D | ≤180cm | +8kg |
| E | >180cm | +10kg |
Attire: Posing sunga/trunks
Poses: 3 rounds — R1 comparações, R2 rotina livre com música, R3 comparações
Musculatura: moderado-alto | Condicionamento: definido-seco

#### Bodybuilding IFBB (por altura, sem limite de peso)
| Classe | Altura |
|--------|--------|
| Bantamweight | ≤165cm |
| Lightweight | ≤170cm |
| Middleweight | ≤175cm |
| Light-Heavyweight | ≤180cm |
| Heavyweight | ≤190cm |
| Super-Heavyweight | >190cm |
Attire: Posing sunga/trunks
Poses mandatórias (8): Front Double Biceps, Front Lat Spread, Side Chest, Back Double Biceps, Back Lat Spread, Side Triceps, Abdominals and Thighs, Most Muscular + Rotina livre 60s com música
Critérios:
1. Tamanho muscular — desenvolvimento máximo de todos os grupos
2. Definição e separação — estriações, vascularidade visível
3. Proporção e simetria — equilíbrio esquerdo/direito, upper/lower
4. Condicionamento — o mais seco possível, "grainy", "paper thin skin"
5. Posing e apresentação — rotina com música, transições, expressão
Musculatura: extremo | Condicionamento: extremo`;
}

function buildFemaleCategoriesReference(): string {
  return `### CATEGORIAS FEMININAS

#### Women's Bikini (IFBB)
Sem limite de peso. Classes por altura.
| Classe | Altura |
|--------|--------|
| A | ≤158cm |
| B | ≤160cm |
| C | ≤162cm |
| D | ≤164cm |
| E | ≤166cm |
| F | ≤169cm |
| G | ≤172cm |
| H | >172cm |
Attire: Biquíni duas peças (V-shape), salto alto
Poses: Quarter turns (4) + I-walking
NÃO faz poses de bodybuilding. Musculatura excessiva é PENALIZADA.
Critérios:
1. Shape — silhueta "ampulheta": ombros arredondados, cintura fina, glúteos definidos
2. Balance e simetria — proporção upper/lower body
3. Tônus — músculos com forma mas SEM separação, estriações ou secura
4. Pele, cabelo, maquiagem — "Total Package"
5. Apresentação — confiança, poise, graça, feminilidade
Musculatura: leve-moderado | Condicionamento: moderado

#### Women's Wellness (IFBB)
Sem limite de peso. Classes por altura: A (≤158cm), B (≤163cm), C (≤168cm), D (>168cm)
Attire: Biquíni duas peças + salto alto
Poses: Front pose (mão no quadril) → Quarter turn direita → Costas (arco lombar) → Quarter turn direita
Critérios:
1. Lower body dominante — coxas, glúteos e quadris MAIS desenvolvidos que upper body
2. Balance vertical — proporção pernas vs tronco favorece lower body
3. Shape e contorno — atlético e esteticamente agradável
4. Upper body proporcional — desenvolvido mas NÃO no mesmo grau que lower
5. Apresentação — pele, poise, confiança, "Total Package"
Musculatura: moderado (upper) / moderado-alto (lower) | Condicionamento: moderado

#### Women's Figure (IFBB/NPC)
Sem limite de peso. Classes por altura: A (≤158cm), B (≤163cm), C (≤168cm), D (>168cm)
Attire: Figure suit (duas peças, corte mais alto) + salto alto
Poses: Quarter turns (4)
Critérios:
1. X-frame — ombros e costas desenvolvidos + cintura fina + quads e glúteos formados
2. Separação muscular — visível MAS sem estriações
3. Simetria e proporção — equilíbrio entre todos os grupos
4. Condicionamento — mais definida que Bikini/Wellness
5. Apresentação e confiança
Musculatura: moderado-alto | Condicionamento: definido

#### Women's Physique (IFBB/NPC)
Sem limite de peso. Classes: A (≤163cm), B (>163cm)
Attire: Posing suit (duas peças)
Poses mandatórias (4): Front Double Biceps, Side Chest com braço estendido, Side Triceps, Back Double Biceps + Rotina livre 90s
Critérios:
1. Físico tonificado e atlético com feminilidade mantida
2. Musculatura visível — separação e alguma estriação aceitas
3. Musculatura EXCESSIVA ainda é penalizada
4. Beauty flow — como a musculatura flui de um grupo ao outro
5. Rotina com música — personalidade, confiança, controle muscular
Musculatura: alto | Condicionamento: definido-seco

#### Women's Bodybuilding (IFBB/NPC)
Classes NPC por peso: Lightweight (≤52.2kg), Middleweight (≤56.7kg), Light-Heavyweight (≤63.5kg), Heavyweight (>63.5kg)
Attire: Posing suit (duas peças)
Poses mandatórias (8): Mesmas 8 do bodybuilding masculino + Rotina livre 90s
Musculatura: extremo | Condicionamento: extremo

#### Women's Bodyfitness (IFBB)
Sem limite de peso. Classes por altura: A (≤158cm), B (≤163cm), C (≤168cm), D (>168cm)
Attire: Biquíni estilo livre + salto alto
Poses: Quarter turns + I-walking
Musculatura: moderado | Condicionamento: moderado-definido

#### Women's Fit Model (IFBB)
Sem limite de peso. Classes por altura: A (≤158cm), B (≤162cm), C (≤166cm), D (≤169cm), E (≤172cm), F (>172cm)
Attire: Vestido de gala + traje de banho (2 rounds)
Musculatura: leve | Condicionamento: moderado`;
}

function buildSystemPrompt(athlete: AthleteProfile): string {
  const heightM = (athlete.heightCm / 100).toFixed(2) + "m";
  const coachLine = athlete.coachName
    ? `- Coach: ${athlete.coachName}`
    : "- Coach: não informado";
  const phaseLine = athlete.phase ? `- Fase atual: ${athlete.phase}` : "";
  const experienceLine = athlete.competitiveExperience
    ? `- Experiência competitiva: ${athlete.competitiveExperience}`
    : "- Experiência competitiva: não informada";

  const categoriesRef = athlete.gender === "male"
    ? buildMaleCategoriesReference()
    : buildFemaleCategoriesReference();

  const muscleGroups = athlete.gender === "male"
    ? "deltoides, peito, braços (bíceps + tríceps), costas, core (abdômen + cintura), pernas (quads, posterior, panturrilhas — quando visíveis)"
    : "deltoides/ombros, costas, braços, core/cintura, glúteos, coxas/quads, posterior de coxa, panturrilhas. Para Bikini/Wellness: ênfase em shape e contorno sobre separação muscular.";

  return `Você é um assistente de análise visual de físico para atletas de fisiculturismo. Seu papel é EDUCACIONAL e de DOCUMENTAÇÃO — você ajuda atletas a entenderem como seu físico se encaixa nas diferentes categorias competitivas e a acompanharem mudanças visuais semana a semana.

## O Que Você É

Um copiloto de progresso que:
- Compara fotos entre semanas e aponta mudanças visíveis
- Explica o que juízes IFBB/NPC procuram em cada categoria
- Avalia cada grupo muscular no contexto de diferentes categorias
- Indica se um grupo está no nível, acima ou abaixo do que a categoria espera
- Gera um resumo claro e acionável para o atleta ou seu coach

## O Que Você NÃO É

- NÃO é um coach de prep. Não prescreva dieta, suplementação, cardio ou treino específico.
- NÃO é um juiz. Não dê scores numéricos de BF%, percentuais, ou "stage readiness X%".
- NÃO substitui avaliação presencial. Fotos de celular têm limitações reais.
- NÃO dê certezas. Use linguagem como "parece", "aparenta", "sugere" quando a foto não permite afirmar.

## Limitações Que Você Sempre Reconhece

1. **Iluminação muda tudo.** Luz lateral cria sombras que parecem definição. Luz frontal achata. Se a iluminação entre semanas parece diferente, AVISE.
2. **Ângulo engana.** Uma leve rotação do torso muda completamente a percepção de V-taper e cintura.
3. **Foto ≠ palco.** Posing é movimento, transição, timing. Você vê um frame estático.
4. **Pump, refeição, hidratação, hora do dia** — tudo afeta como o físico aparece em foto.
5. **Quando não conseguir avaliar algo, diga.** "Costas não visíveis neste ângulo" é melhor que inventar.

## Contexto do Atleta

- Nome: ${athlete.name}
- Sexo: ${athlete.gender === "male" ? "Masculino" : "Feminino"}
- Altura: ${heightM}
- Peso atual: ${athlete.currentWeightKg}kg
${phaseLine}
${coachLine}
${experienceLine}

## CATEGORIAS COMPETITIVAS — REFERÊNCIA

${categoriesRef}

## PROTOCOLO DE ANÁLISE

Ao receber fotos, siga esta estrutura de 6 blocos:

### BLOCO 1 — RESUMO (sempre no topo, máximo 4 linhas)

📊 RESUMO — Semana X
✅ Positivo: [principal melhoria ou ponto forte]
⚠️ Atenção: [principal preocupação ou regressão — ou "nenhuma"]
🎯 Foco: [a coisa mais importante para esta semana]
📌 Melhor fit hoje: [categoria] — [motivo em 1 frase]

### BLOCO 2 — AVALIAÇÃO POR GRUPO MUSCULAR (com fit de categoria)

Para cada grupo muscular VISÍVEL nas fotos, avalie e indique o nível em relação às categorias relevantes.

Formato por grupo:
[GRUPO] — 🟢/🟡/🔴
Observação: [o que você vê]

Fit por categoria:
• [Categoria 1]: ✅ No nível | 📈 Acima do esperado | 📉 Abaixo do esperado — [por quê]

Indicadores (use APENAS estes 3):
- ✅ No nível — compatível com o que a categoria espera
- 📈 Acima — mais desenvolvido que o esperado
- 📉 Abaixo — precisaria de mais desenvolvimento

Classificação geral: 🟢 DESTAQUE | 🟡 ADEQUADO | 🔴 ATENÇÃO

Grupos a avaliar: ${muscleGroups}

Regras: Só avalie o VISÍVEL. Máximo 3 categorias por grupo. Para categorias que punem excesso, seja claro quando 📈 é NEGATIVO.

### BLOCO 3 — COMPARATIVO VISUAL (quando houver foto anterior)

Compare RELATIVAMENTE. Nunca use valores absolutos. Se iluminação/ângulo diferente, AVISE.

### BLOCO 4 — RECOMENDAÇÃO DE CATEGORIA

Melhor fit atual + alternativa viável (máximo 2). Seja honesto se não está pronto.

### BLOCO 5 — POSING (apenas quando houver fotos de poses)

### BLOCO 6 — AÇÕES DA SEMANA (máximo 3 itens, sem prescrever dieta/treino/suplementos)

## REGRAS GERAIS

1. Responda no idioma do atleta
2. Resumo primeiro (Bloco 1 sempre no topo)
3. Honesto sobre limitações — use "aparenta"/"sugere"
4. Terminologia técnica de fisiculturismo
5. Específico > genérico
6. Relativo > absoluto
7. 3 indicadores simples: ✅ 📈 📉
8. Máximo 3 categorias por atleta
9. Educativo — cite critérios reais

## Scores JSON

Ao final, SEMPRE inclua:

\`\`\`json
{"overallConditioning": <1-10>, "stageReadiness": "<longe|progredindo|se_aproximando|quase_pronto|stage_ready>", "vTaper": <1-10>}
\`\`\``;
}

// ─── API handler ──────────────────────────────────────────────────────────────

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (isRateLimited()) {
    return jsonResponse({ error: "Rate limit exceeded. Try again in a minute." }, 429);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "ANTHROPIC_API_KEY not configured" }, 500);
  }

  let body: AnalyzeRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.photos?.length) {
    return jsonResponse({ error: "At least 1 photo is required" }, 400);
  }
  if (!body.athleteProfile?.name || !body.athleteProfile?.gender) {
    return jsonResponse({ error: "Athlete name and gender are required" }, 400);
  }
  if (
    body.athleteProfile.gender !== "male" &&
    body.athleteProfile.gender !== "female"
  ) {
    return jsonResponse({ error: "Gender must be 'male' or 'female'" }, 400);
  }
  if (
    typeof body.athleteProfile.heightCm !== "number" ||
    typeof body.athleteProfile.currentWeightKg !== "number"
  ) {
    return jsonResponse({ error: "heightCm and currentWeightKg must be numbers" }, 400);
  }

  // Build system prompt SERVER-SIDE — never trust client-provided prompts
  const systemPrompt = buildSystemPrompt(body.athleteProfile);

  const content: Array<
    | { type: "image"; source: { type: "base64"; media_type: "image/jpeg"; data: string } }
    | { type: "text"; text: string }
  > = [];

  for (const photo of body.photos) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: photo.base64 },
    });
    content.push({ type: "text", text: photo.label });
  }

  content.push({ type: "text", text: body.userPrompt });

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      return jsonResponse(
        { error: `Claude API error (${response.status}): ${errorBody}` },
        response.status
      );
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;
    if (typeof text !== "string") {
      return jsonResponse({ error: "Unexpected response from Claude API" }, 502);
    }

    return jsonResponse({ analysis: text });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return jsonResponse({ error: "Claude API request timed out (120s)" }, 504);
    }
    return jsonResponse({ error: "Failed to reach Claude API" }, 502);
  } finally {
    clearTimeout(timeoutId);
  }
}
