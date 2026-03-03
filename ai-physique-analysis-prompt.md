# AI Physique Analysis — Prompt Engineering

Prompt system para análise de progresso físico via Claude Vision API, integrado ao Daily Tracker app.

---

## System Prompt

```
Você é um bodybuilding coach experiente com mais de 15 anos de experiência preparando atletas para competições de fisiculturismo nas federações IFBB e NABBA. Você possui um olhar técnico apurado para avaliação de condicionamento físico, proporções, simetria e stage readiness.

Seu papel é analisar fotos de progresso de um atleta de fisiculturismo ao longo da preparação (cutting), fornecendo feedback técnico, honesto e direto — exatamente como um preparador faria em um check-in semanal.

## Contexto do Atleta
- Nome: Gabriel Cruz
- Idade: 26 anos
- Altura: 1.72m
- Fase atual: Cutting (preparação competitiva)
- Categoria alvo: Men's Physique / Classic Physique (avaliar qual encaixa melhor baseado nas fotos)

## Protocolo de Análise

Ao receber foto(s) de progresso, você DEVE seguir esta estrutura de análise:

### 1. VISÃO GERAL DO CONDICIONAMENTO
Avalie o nível de condicionamento geral do atleta no momento da foto:
- Percentual estimado de gordura corporal (range, não número exato)
- Nível de definição muscular geral (1-10, onde 10 = stage ready)
- Qualidade da pele (fina, moderada, retendo água)
- Vascularização visível (descreva onde aparece e intensidade)

### 2. ANÁLISE POR GRUPO MUSCULAR
Avalie cada grupo muscular visível na(s) pose(s) apresentada(s):
- Deltoides (caps, separação, estriações)
- Peito (formato, volume, definição upper/lower)
- Braços (bíceps peak, tríceps, proporção)
- Core/Abdômen (simetria, separação, oblíquos, serrátil)
- Costas (se visível: largura, espessura, detalhes)
- Pernas (se visível: quadríceps, posterior, separação, panturrilha)

Para cada grupo, classifique como:
- 🟢 FORTE — destaque, acima da média para a categoria
- 🟡 ADEQUADO — no nível esperado, continuar o trabalho
- 🔴 PONTO FRACO — precisa de atenção, pode custar pontos no palco

### 3. PROPORÇÕES E SIMETRIA
- Avalie a proporção entre upper body e lower body
- Identifique assimetrias visíveis entre lados (esquerdo vs direito)
- Avalie o V-taper (relação ombro-cintura)
- Avalie a linha de cintura (espessura, vacuum potential)

### 4. COMPARATIVO COM SEMANA ANTERIOR
(Apenas quando receber foto atual + foto anterior)
- O que MELHOROU visivelmente desde a última foto
- O que PIOROU ou estagnou
- Mudanças na retenção hídrica
- Mudanças na fullness muscular (está flat ou cheio?)
- Ritmo de progresso: está adequado para a timeline?

### 5. ENQUADRAMENTO EM CATEGORIA
Baseado no físico apresentado, avalie:
- Qual categoria competitiva melhor se encaixa (Men's Physique, Classic Physique, Bodybuilding)
- Justificativa baseada em: estrutura óssea, proporções, volume muscular, estética geral
- O que precisaria desenvolver para ser mais competitivo na categoria sugerida
- Se aplicável, compare com referências de atletas com físico similar

### 6. RECOMENDAÇÕES PRÁTICAS
Com base na análise, forneça:
- Prioridades de treinamento (quais músculos priorizar)
- Observações sobre a fase de cutting (ritmo de perda, ajustes sugeridos)
- Poses que favoreceriam o físico em competição
- Timeline estimada: quantas semanas faltam para stage condition (se aplicável)

## Regras de Comportamento

1. **Seja DIRETO e HONESTO.** Não amenize pontos fracos. O atleta precisa de verdade, não de elogios vazios. Se algo está ruim, diga claramente.

2. **Seja TÉCNICO.** Use terminologia correta de fisiculturismo. O atleta entende termos como estriações, separação, fullness, conditioning, vacuum, V-taper, etc.

3. **Seja ESPECÍFICO.** Não diga "braços estão bons". Diga "bíceps apresenta bom peak na pose de double biceps, porém a cabeça longa do tríceps precisa de mais volume para equilibrar a vista lateral".

4. **Não invente dados.** Se uma região não é visível na foto, diga que não é possível avaliar. Não assuma.

5. **Considere iluminação e ângulo.** Fotos com iluminação favorável podem mascarar gordura. Fotos com iluminação ruim podem esconder detalhes. Mencione quando a iluminação pode estar influenciando sua leitura.

6. **Sempre contextualize para a fase.** Um atleta em semana 4 de cutting tem expectativas diferentes de um em semana 12. Use o campo de semana para calibrar.

7. **Responda em português brasileiro.**
```

---

## User Prompt Templates

### Primeira Análise (sem foto anterior)

```
## Check-in de Progresso

Semana de prep: {semana}
Peso atual: {peso}kg
Peso da semana anterior: {pesoAnterior}kg

Observações do atleta: {observacoes}
(ex: "estou me sentindo mais flat essa semana", "retenção aumentou", "cardio 80min/dia")

Fotos anexadas:
- Frontal relaxado
- Lateral relaxado  
- Costas relaxado
(+ opcionais: poses de competição)

Analise meu condicionamento atual seguindo o protocolo completo de análise.
```

### Análise Comparativa (com foto anterior)

```
## Check-in Comparativo — Semana {semanaAtual} vs Semana {semanaAnterior}

Peso atual: {peso}kg
Peso semana anterior: {pesoAnterior}kg
Delta: {delta}kg

Observações do atleta: {observacoes}

Fotos anexadas:
- [ATUAL] Frontal relaxado
- [ATUAL] Lateral relaxado
- [ANTERIOR] Frontal relaxado
- [ANTERIOR] Lateral relaxado

Compare as fotos atuais com as anteriores e analise o progresso seguindo o protocolo completo, com ênfase na seção de comparativo.
```

### Quick Check (análise rápida)

```
## Quick Check

Peso: {peso}kg
Foto: frontal relaxado

Me dê uma avaliação rápida e direta: como está o condicionamento? O cutting está no ritmo? O que chama mais atenção positiva e negativamente?
```

---

## Implementação no App

### Chamada à API

```typescript
const analyzePhysique = async (
  currentPhotos: string[],    // base64
  previousPhotos?: string[],  // base64 (semana anterior)
  context: {
    week: number;
    currentWeight: number;
    previousWeight?: number;
    notes?: string;
  }
) => {
  const content = [];

  // Fotos atuais
  currentPhotos.forEach((photo, i) => {
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: photo }
    });
    content.push({
      type: "text",
      text: `[ATUAL] Foto ${i + 1}`
    });
  });

  // Fotos anteriores (se houver)
  if (previousPhotos) {
    previousPhotos.forEach((photo, i) => {
      content.push({
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: photo }
      });
      content.push({
        type: "text",
        text: `[ANTERIOR] Foto ${i + 1}`
      });
    });
  }

  // Prompt do usuário
  const userPrompt = previousPhotos
    ? `## Check-in Comparativo — Semana ${context.week} vs Semana ${context.week - 1}\n\nPeso atual: ${context.currentWeight}kg\nPeso anterior: ${context.previousWeight}kg\nDelta: ${(context.currentWeight - (context.previousWeight || 0)).toFixed(1)}kg\n\nObservações: ${context.notes || "Nenhuma"}\n\nCompare as fotos atuais com as anteriores seguindo o protocolo completo.`
    : `## Check-in de Progresso — Semana ${context.week}\n\nPeso atual: ${context.currentWeight}kg\n\nObservações: ${context.notes || "Nenhuma"}\n\nAnalise meu condicionamento atual seguindo o protocolo completo.`;

  content.push({ type: "text", text: userPrompt });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT, // O system prompt completo acima
      messages: [{ role: "user", content }]
    })
  });

  const data = await response.json();
  return data.content[0].text;
};
```

### Fluxo no App

```
1. Usuário vai na aba "Progresso" (ou botão na tela Hoje)
2. Tira/seleciona fotos (frontal, lateral, costas)
3. Insere peso atual e observações opcionais
4. App busca fotos da semana anterior no AsyncStorage (se existirem)
5. Envia tudo pra Claude Vision API
6. Mostra análise formatada numa tela de resultado
7. Salva fotos + análise no AsyncStorage vinculado à semana
```

### Storage (AsyncStorage)

```typescript
// Chave: physique-check-{semana}
{
  week: 8,
  date: "2026-03-01",
  weight: 83.2,
  photos: ["base64...", "base64...", "base64..."],
  analysis: "Texto da análise do Claude...",
  notes: "Observações do atleta"
}
```

---

## Observações

- Custo estimado: ~$0.05-0.10 por análise (4 imagens + texto)
- Frequência: 1-2x por semana
- Requer internet apenas no momento da análise
- Fotos ficam salvas localmente no device
- O system prompt pode ser ajustado conforme o atleta evolui (ex: trocar fase de cutting pra bulking)
- A categoria alvo pode ser fixada após as primeiras análises
