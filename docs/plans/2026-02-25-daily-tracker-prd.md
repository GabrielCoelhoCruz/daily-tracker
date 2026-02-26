# PRD — Daily Tracker: Dieta & Suplementação

**Data:** 2026-02-25
**Status:** Draft
**Versão:** 1.2

---

## 1. Visão Geral

App pessoal para acompanhamento diário de dieta, suplementos, medicamentos manipulados, hidratação, cardio e treino. Baseado no plano mensal da Team GB.

**Problema:** Protocolo complexo com 20+ itens diários distribuídos em múltiplas refeições, com regras condicionais por dia da semana. Fácil esquecer itens, difícil saber a aderência real ao longo do tempo.

**Solução:** App offline-first com checklist diária inteligente que monta automaticamente os itens do dia, trackers de hidratação e cardio, consulta rápida do treino, e histórico de aderência com insights acionáveis.

**Usuário:** Gabriel Cruz, 26 anos, 1.72m, 85kg. Objetivo: Cutting. Consultoria Team GB.

---

## 2. Decisões de Design

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Navegação | 3 tabs (Hoje / Treino / Histórico) | Clean, config raramente acessada vai no header |
| Tema | Dark mode only | App fitness, uso manhã/noite |
| Paleta | `#0c0a09` bg, `#1c1917` cards, `#f59e0b` amber accent | Energia, personalidade. Verde reservado para checkmarks |
| Notificações | Simples por período + hidratação periódica | Quick-actions no Expo são frágeis |
| Histórico | Calendário mensal + stats card | Visão macro + insights acionáveis |
| Plano | Hardcoded em TypeScript | Atualização mensal via código, sem UI de edição |
| Dev/Deploy | Expo Go via QR code | Sem Apple Developer Account, hot reload pro plano |
| Persistência | Zustand + AsyncStorage com middleware persist | Ciclo save/load transparente, sem lógica manual espalhada |
| Haptic feedback | expo-haptics nos checks e incrementos | UX tátil em app de uso intenso de taps |

---

## 3. Tech Stack

- **Framework:** React Native + Expo (Expo Router)
- **Linguagem:** TypeScript
- **Storage local:** AsyncStorage
- **Notificações:** expo-notifications (locais)
- **Haptics:** expo-haptics (feedback tátil)
- **Estado:** Zustand (com middleware `persist` → AsyncStorage)
- **UI:** NativeWind (Tailwind CSS no React Native)
- **Dev/Test:** Expo Go (QR code, sem build nativo)

---

## 4. Arquitetura de Navegação

```
App (Expo Router)
├── (tabs)/
│   ├── index.tsx          → Tab "Hoje" (checklist principal)
│   ├── treino.tsx         → Tab "Treino" (consulta do dia)
│   └── historico.tsx      → Tab "Histórico" (calendário + stats)
└── config.tsx             → Modal de configurações (via gear icon no header)
```

### Tab "Hoje"
- Header: data do dia, toggle "Dia Off", gear icon (config)
- Progress bar geral do dia (ex: 14/20 — amber). Itens opcionais não contam no total.
- Seções colapsáveis por período/refeição
- Cada seção mostra itens com sub-itens (suplementos atrelados)
- Itens opcionais (ex: abdômen, panturrilha) com visual diferenciado (texto muted, não impactam progress bar)
- Seção de Hidratação (tracker de volume)
- Seção de Cardio (tracker de minutos)
- Indicador de Refeição Livre (0/1 semanal)
- Acesso rápido à seção de Dicas (ícone de info ou seção colapsável no final)

### Tab "Treino"
- Header: nome do treino do dia (ex: "A — Peito")
- Lista de exercícios com séries e observações
- Seção de dicas de treino (colapsável no topo ou final)
- Apenas consulta, sem input

### Tab "Histórico"
- Calendário mensal com indicadores de cor por dia
- Stats card fixo abaixo: streak, aderência semanal/mensal %, top 3 itens mais esquecidos

### Modal "Config"
- Toggles de notificação por período/refeição
- Horários base por refeição
- Toggle de lembrete de hidratação (intervalo configurável)

---

## 5. Modelo de Dados

### 5.1 Plano Hardcoded (TypeScript)

```typescript
type Categoria = "refeicao" | "suplemento" | "manipulado" | "cardio" | "hidratacao";

type RegraCondicional = {
  diasDaSemana?: number[];       // 0=dom, 1=seg, ..., 6=sab
  apenasEmDiaDeTreino?: boolean;
};

type ItemDoPlano = {
  id: string;
  nome: string;
  dosagem?: string;
  categoria: Categoria;
  regra?: RegraCondicional;
  opcional?: boolean;            // Itens opcionais não contam na aderência (ex: abdômen, panturrilha)
  subItens?: ItemDoPlano[];      // Suplementos/manipulados atrelados a este item
};

type Periodo = {
  id: string;
  nome: string;                  // "Jejum", "Refeição 1", "Intra Treino", etc.
  horarioBase?: string;          // "06:30" — usado pra notificação
  itens: ItemDoPlano[];
};

type Dica = {
  id: string;
  categoria: "nutricao" | "treino" | "geral";
  texto: string;
};

type Plano = {
  periodos: Periodo[];
  treinos: Treino[];
  dicas: Dica[];
  metaHidratacao: { aguaMl: number; chaMl: number };
  metaCardioMin: number;
};
```

### 5.2 Estado Persistido (Zustand + AsyncStorage)

```typescript
type DayState = {
  // Checks do dia (reseta às 4h)
  checks: Record<string, { checked: boolean; timestamp: number | null }>;
  diaOffManual: boolean;

  // Hidratação do dia (reseta às 4h)
  aguaMl: number;
  chaMl: number;

  // Cardio do dia (reseta às 4h)
  sessoesCardio: { duracaoMin: number }[];

  // Refeição livre (reseta toda segunda às 4h)
  refeicaoLivreUsada: boolean;
  refeicaoLivrePeriodoId: string | null; // Qual período foi substituído
  semanaRefeicaoLivre: string;           // ISO week identifier

  // Metadata
  ultimoReset: string; // ISO date do último reset
};
```

### 5.3 Histórico (Zustand store com persist)

```typescript
type HistoricoDia = {
  data: string;              // "2026-02-25"
  completados: number;
  total: number;
  itensPerdidos: string[];   // ["NAC ceia", "Omega 3 ceia"]
};

type HistoryState = {
  dias: Record<string, HistoricoDia>;
  // Key: data ISO → ~30 objetos/mês, custo mínimo
};
```

---

## 6. Dados Completos do Plano (Fevereiro/2026)

### 6.1 Protocolo Hormonal

| Substância | Dosagem | Frequência | Condição |
|-----------|---------|------------|----------|
| Enantesto de Testosterona | 150mg | Segunda, quarta e sexta | `diasDaSemana: [1, 3, 5]` |
| Masteron | 100mg | Segunda, quarta e sexta | `diasDaSemana: [1, 3, 5]` |
| Trembolona Acetato | 75mg | Segunda, quarta e sexta | `diasDaSemana: [1, 3, 5]` |
| Oxandrolona | 40mg | Dias de treino (1h pré treino) | `apenasEmDiaDeTreino: true` |
| Anastrozol | 0,5mg | Segunda e sexta (em jejum) | `diasDaSemana: [1, 5]` |

**Totais semanais:** Enantest 450mg/sem, Masteron 300mg/sem, Trembolona 225mg/sem.

### 6.2 Períodos e Refeições Completas

#### Jejum
| Item | Dosagem | Categoria |
|------|---------|-----------|
| Cafeína | 220mg | manipulado |
| Ioimbina | 10mg | manipulado |
| Teacrine | 150mg | manipulado |
| Anastrozol | 0,5mg | manipulado |

*Anastrozol: apenas segunda e sexta (`diasDaSemana: [1, 5]`).*

#### Refeição 1 — Desjejum / Pré Treino

**Comida:**
| Item | Dosagem | Categoria |
|------|---------|-----------|
| Claras de ovo | 6 unidades | refeicao |
| Ovos inteiros | 2 unidades | refeicao |
| Aveia | 30g | refeicao |
| Mamão | 100g | refeicao |
| Semente de chia | 10g | refeicao |
| Pasta de amendoim | 20g | refeicao |
| Canela e adoçante | a gosto | refeicao |

**Suplementos (sub-itens da Refeição 1):**
| Item | Dosagem | Categoria |
|------|---------|-----------|
| Vitamina C | 1g | suplemento |
| Polivitamínico TEAM GB | 1 dose | suplemento |
| NAC | 600mg | suplemento |
| Omega 3 | 2000mg | suplemento |
| Vitamina E | 400ui | suplemento |
| Berberina | 500mg | manipulado |
| Nattokinase | 150mg | manipulado |
| Dobesilato de Cálcio | 500mg | manipulado |

#### Refeição 2 — Pré Treino

**Comida:**
| Item | Dosagem | Categoria |
|------|---------|-----------|
| Peito de frango ou filé de tilápia | 180g | refeicao |
| Arroz ou macarrão | 90g | refeicao |
| Azeite de oliva extra virgem | 8g | refeicao |
| Vegetais | 100g | refeicao |
| Folhas | à vontade | refeicao |

**Suplementos (sub-itens da Refeição 2):**
| Item | Dosagem | Categoria |
|------|---------|-----------|
| Cafeína | 220mg | manipulado |
| Ioimbina | 10mg | manipulado |
| Teacrine | 150mg | manipulado |
| Vitamina C | 1g | suplemento |

**Manipulado condicional (sub-item da Refeição 2):**
| Item | Dosagem | Categoria | Condição |
|------|---------|-----------|----------|
| Oxandrolona | 40mg | manipulado | `apenasEmDiaDeTreino: true` (1h pré treino) |

#### Intra Treino (apenas dias de treino)

| Item | Dosagem | Categoria |
|------|---------|-----------|
| Intensity Hunter (Heavy Suppz) | 40g | suplemento |
| Glutamina | 10g | suplemento |
| Creatina | 10g | suplemento |
| EAAs | 10g | suplemento |

*Todo o período é condicional: `apenasEmDiaDeTreino: true`.*

#### Refeição 3 — Pós Treino

**Comida:**
| Item | Dosagem | Categoria |
|------|---------|-----------|
| Killer Whey (Heavy Suppz) | 40g | suplemento |
| Morango | 100g | refeicao |

**Suplementos (sub-itens da Refeição 3):**
| Item | Dosagem | Categoria |
|------|---------|-----------|
| Glifage XR | 500mg | manipulado |
| NAC | 600mg | suplemento |
| Picolinato de Cromo | 350mcg | suplemento |
| Cafeína | 210mg | manipulado |

#### Refeição 4

**Comida:**
| Item | Dosagem | Categoria |
|------|---------|-----------|
| Peito de frango ou filé de tilápia | 180g | refeicao |
| Batata inglesa | 90g | refeicao |
| Abacaxi ou kiwi | 100g | refeicao |
| Azeite de oliva extra virgem | 8g | refeicao |
| Vegetais | 100g | refeicao |
| Folhas | à vontade | refeicao |

*Sem suplementos neste período.*

#### Refeição 5 — Ceia

**Comida:**
| Item | Dosagem | Categoria |
|------|---------|-----------|
| Carne vermelha magra | 180g | refeicao |
| Ovos inteiros | 2 unidades | refeicao |
| Batata inglesa | 90g | refeicao |
| Mamão | 100g | refeicao |
| Vegetais | 100g | refeicao |
| Folhas | à vontade | refeicao |

**Suplementos (sub-itens da Refeição 5/Ceia):**
| Item | Dosagem | Categoria |
|------|---------|-----------|
| Vitamina C | 1g | suplemento |
| Glifage XR | 500mg | manipulado |
| Omega 3 | 2000mg | suplemento |
| Vitamina E | 400ui | suplemento |
| NAC | 600mg | suplemento |
| Nattokinase | 150mg | manipulado |

#### Protocolo Hormonal (período separado — aplicação)

| Item | Dosagem | Categoria | Condição |
|------|---------|-----------|----------|
| Enantest | 150mg | manipulado | `diasDaSemana: [1, 3, 5]` |
| Masteron | 100mg | manipulado | `diasDaSemana: [1, 3, 5]` |
| Trembolona Acetato | 75mg | manipulado | `diasDaSemana: [1, 3, 5]` |

#### Itens Opcionais (não contam na aderência)

| Item | Categoria | Condição |
|------|-----------|----------|
| Abdômen (2-3 exercícios, 12-15 séries) | treino | `apenasEmDiaDeTreino: true`, `opcional: true` |
| Panturrilha (2-3 exercícios, 12-15 séries) | treino | `apenasEmDiaDeTreino: true`, `opcional: true` |

*Meta: 3x na semana cada, separado do treino principal.*

### 6.3 Metas Diárias

| Meta | Valor |
|------|-------|
| Hidratação — Água mineral | 4.000ml (mínimo) |
| Hidratação — Chá de cavalinha | 500ml (mínimo) |
| Cardio | 80min (preferencialmente dividir em 2 sessões) |
| Refeição livre | 1/semana, apenas em dias de treino |

### 6.4 Treinos Completos (Periodização A/B/C/D/E)

#### A: Peito (Segunda)

| # | Exercício | Séries |
|---|-----------|--------|
| 1 | Supino inclinado máquina/hammer | 2x WS + 2x TS |
| 2 | Supino inclinado (smith) | 2x WS + 1x TS |
| 3 | Crucifixo inclinado (halteres) | 2x WS + 1x TS + 1x BS (15) |
| 4 | Supino reto (máquina) | 2x WS + 1x TS + 1x CS (4+4+4) |
| 5 | Crucifixo/peck deck (máquina) | 2x WS + 1x TS |
| 6 | Supino declinado com halteres | 1x WS + 1x TS + 1x BS (15) |
| 7 | Cross over | 2x WS + 1x TS |

#### B: Costas (Terça)

| # | Exercício | Séries |
|---|-----------|--------|
| 1 | Remada curvada (pronada) | 2x WS + 2x TS |
| 2 | Remada cavalinho (supinada) | 2x WS + 1x TS + 1x BS (15) |
| 3 | Remada baixa (neutra/triângulo) | 2x WS + 1x TS |
| 4 | Puxada frente aberta (pronada) | 2x WS + 1x TS |
| 5 | Puxada frente (fechada/supinada) | 3x WS |
| 6 | Pulldown corda | 2x WS + 1x TS |
| 7 | Hiperextensão lombar (com carga) | 3x WS |

#### C: Pernas (Quarta)

| # | Exercício | Séries |
|---|-----------|--------|
| 1 | Agachamento no smith | 2x WS + 2x TS |
| 2 | Leg press 45° | 2x WS + 2x TS |
| 3 | Stiff barra livre | 2x WS + 1x TS + 1x TS |
| 4 | Mesa flexora | 2x WS + 1x TS + 1x CS (5+5+5/10seg) |
| 5 | Cadeira extensora (1seg pico de contração) | 2x WS + 2x TS |
| 6 | Cadeira abdutora | 2x WS + 1x TS |
| 7 | Elevação pélvica | 2x WS + 1x TS |
| 8 | Cadeira adutora | 2x WS + 1x TS |

#### D: Ombros (Quinta)

| # | Exercício | Séries |
|---|-----------|--------|
| 1 | Desenvolvimento (máquina) | 2x WS + 2x TS |
| 2 | Elevação frontal com halteres simultâneo (banco 45° com peito apoiado) | 2x WS + 1x TS |
| 3 | Elevação lateral com halteres | 2x WS + 2x TS + 1x BS (15) |
| 4 | Elevação lateral máquina (1seg pico de contração) | 2x WS + 1x TS + 1x CS (5+5+5) |
| 5 | Elevação lateral unilateral com halter sentado | 2x WS + 1x TS |
| 6 | Crucifixo inverso (halteres) | 2x WS + 1x TS |
| 7 | Encolhimento no smith | 3x WS |

#### E: Braços (Sexta)

| # | Exercício | Séries |
|---|-----------|--------|
| 1 | Rosca martelo com halteres simultâneo | 2x WS + 1x TS |
| 2 | Tríceps francês halter | 2x WS + 1x TS |
| 3 | Rosca direta na polia (barra W) | 2x WS + 1x TS |
| 4 | Tríceps polia (barra W) | 2x WS + 1x TS |
| 5 | Rosca Scott (máquina) | 2x WS + 1x TS |
| 6 | Tríceps testa (polia alta/corda) | 2x WS + 1x TS |
| 7 | Rosca simultânea no banco 45° com halteres | 2x WS + 1x TS |
| 8 | Tríceps polia com corda | 2x WS + 1x TS |
| 9 | Rosca inversa | 3x WS |

### 6.5 Legenda de Séries

| Sigla | Nome | Descrição |
|-------|------|-----------|
| **WS** | Working Set | Séries de trabalho. Progredir cargas, 8-12 reps até falha ou próximo. |
| **TS** | Top Set | Melhor série. Máxima sobrecarga, 5-8 reps até falha. |
| **BS** | Back-off Set | Série de redução. 50-60% da carga, reps prescritas (geralmente 15). |
| **CS** | Cluster Set | Série em blocos. Descanso breve entre blocos de reps (ex: 4+4+4 ou 5+5+5). |

**Séries não contabilizadas (feitas antes das séries válidas):**
- **Warm-up:** 1 série de aquecimento nos 2 primeiros exercícios, carga leve, 10-15 reps, sem falha.
- **Feeder Set:** 1 série de reconhecimento com carga próxima da WS, sem falha, prepara para as séries de trabalho.

**Intervalos:**
- Warm-up / Feeder: máx 45seg
- Working Sets: 60-120seg
- Top Sets: 120-240seg

---

## 7. Dicas e Orientações do Planejamento

Conteúdo extraído diretamente do planejamento do personal, exibido no app como referência rápida.

### 7.1 Dicas de Nutrição

```typescript
const dicasNutricao: Dica[] = [
  {
    id: "nut-01",
    categoria: "nutricao",
    texto: "Alimentos pesados todos já preparados/prontos/cozidos (caso levar legumes ou carboidratos ao forno ou air fryer, pesar antes)."
  },
  {
    id: "nut-02",
    categoria: "nutricao",
    texto: "Prepare os alimentos sem adição de temperos prontos, óleos e corantes/conservantes. Use um fio de azeite ou óleo de coco para untar, espalhando com papel toalha para retirar o excesso."
  },
  {
    id: "nut-03",
    categoria: "nutricao",
    texto: "Temperos naturais liberados: pimenta, orégano, cominho, páprica, açafrão, curry, chimichurri, alho (desde que não tenha valor nutricional que atrapalhe o protocolo)."
  },
  {
    id: "nut-04",
    categoria: "nutricao",
    texto: "Molhos/caldas/temperos zero calorias (Mr Taste) estão liberados, com moderação."
  },
  {
    id: "nut-05",
    categoria: "nutricao",
    texto: "Ketchup e mostarda zero açúcar de supermercado (Hemmer e afins) pode usar, mas com moderação."
  },
  {
    id: "nut-06",
    categoria: "nutricao",
    texto: "Liberados: refrigerantes ZERO AÇÚCAR, suco Clight, gelatina zero, café preto sem açúcar. Com moderação, e NÃO contam na meta de ingestão de líquido diária."
  },
  {
    id: "nut-07",
    categoria: "nutricao",
    texto: "Sal/sódio sem restrição — use a quantidade suficiente para salgar a comida, sem exageros. Evitar temperos prontos/industrializados com alta concentração de sódio."
  },
  {
    id: "nut-08",
    categoria: "nutricao",
    texto: "Seguir o protocolo 100%: fazer uma refeição a mais ou deixar de fazer uma compromete os resultados. Os cálculos foram feitos em cima das suas necessidades nutricionais."
  },
  {
    id: "nut-09",
    categoria: "nutricao",
    texto: "Nos dias que seus horários mudarem ou acordar mais tarde, reorganize a ordem das refeições para bater calorias e macros. Mantenha sempre pré e pós treino antes e depois do treino."
  },
  {
    id: "nut-10",
    categoria: "nutricao",
    texto: "Evitar beliscos entre refeições (oleaginosas, biscoitos, barra de proteína/cereal, pasta de amendoim). São calorias extras não contabilizadas no plano."
  },
  {
    id: "nut-11",
    categoria: "nutricao",
    texto: "Refeição livre: 1 por semana, sempre em dias de treino. Trocar UMA refeição do cardápio pela livre. Não exagere — extrapolar o saldo calórico pode comprometer os resultados da semana."
  },
  {
    id: "nut-12",
    categoria: "nutricao",
    texto: "Caso não se adapte com algum alimento, envie no relatório para o personal avaliar uma troca que caiba no plano."
  }
];
```

### 7.2 Dicas de Treino

```typescript
const dicasTreino: Dica[] = [
  {
    id: "treino-01",
    categoria: "treino",
    texto: "Exercícios de mobilidade, alongamentos e pré-ativações antes da sessão, enfatizando a musculatura que será trabalhada e sinergistas."
  },
  {
    id: "treino-02",
    categoria: "treino",
    texto: "Fazer 1 série de warm-up nos 2 primeiros exercícios: carga leve, 10-15 reps, sem chegar a falha. O intuito é aquecer e jogar sangue no músculo."
  },
  {
    id: "treino-03",
    categoria: "treino",
    texto: "Após warm-up, fazer 1 feeder set: carga próxima das séries de trabalho, sem chegar a falha. Série de reconhecimento da carga."
  },
  {
    id: "treino-04",
    categoria: "treino",
    texto: "Working Sets (WS): progredir as cargas mantendo 8-12 reps até falha ou muito próximo dela."
  },
  {
    id: "treino-05",
    categoria: "treino",
    texto: "Top Sets (TS): melhores séries. Máximo de sobrecarga para 5-8 reps chegando a falha."
  },
  {
    id: "treino-06",
    categoria: "treino",
    texto: "Cluster Sets (CS): séries em blocos com descanso breve entre cada bloco de reps (prescrito em parênteses)."
  },
  {
    id: "treino-07",
    categoria: "treino",
    texto: "Back-off Sets (BS): redução de 50-60% da carga, reps prescritas (geralmente 15)."
  },
  {
    id: "treino-08",
    categoria: "treino",
    texto: "Intervalos: máx 45seg entre warm-up/feeder, 60-120seg entre WS, 120-240seg para TS."
  },
  {
    id: "treino-09",
    categoria: "treino",
    texto: "Em todas as séries, busque conexão mente-músculo para contração mais efetiva."
  },
  {
    id: "treino-10",
    categoria: "treino",
    texto: "Buscar boa amplitude nos exercícios. Qualquer dificuldade de amplitude, relatar ao personal."
  },
  {
    id: "treino-11",
    categoria: "treino",
    texto: "Cadência: prezar sempre por boa cadência nos movimentos (excêntrica e concêntrica) para aumentar tempo de tensão."
  },
  {
    id: "treino-12",
    categoria: "treino",
    texto: "Abdômen e panturrilhas: 3x na semana cada, separado do treino, 2-3 exercícios / 12-15 séries válidas."
  },
  {
    id: "treino-13",
    categoria: "treino",
    texto: "Cardio: 80min todos os dias, horário conforme disponibilidade. Preferencialmente dividir em 2 sessões."
  }
];
```

### 7.3 Onde as Dicas Aparecem no App

| Local | Conteúdo | Comportamento |
|-------|----------|---------------|
| Tab Hoje — seção colapsável "Dicas" no final | Dicas de nutrição | Colapsada por padrão, expande ao tocar |
| Tab Treino — seção colapsável "Dicas de Treino" no final | Dicas de treino + legenda de séries | Colapsada por padrão, expande ao tocar |

As dicas são hardcoded em `data/dicas.ts` (ou inline em `data/plano.ts`). Exibidas como lista de cards com ícone de info e texto.

---

## 8. Features Detalhadas

### 8.1 Checklist Diário

**Comportamento:**
- App detecta dia da semana atual e monta a lista de itens aplicáveis
- Itens agrupados por período/refeição
- Sub-itens (suplementos atrelados a uma refeição) aparecem indentados abaixo do item pai
- Itens com `opcional: true` aparecem com visual muted e não contam no total/completados da progress bar nem na aderência do histórico
- Check/uncheck salva timestamp e dispara haptic feedback (`expo-haptics`)
- Progress bar no topo: `completados/total` — cor amber, texto amber
- Checkmarks usam cor verde (`#22c55e`) para contraste visual claro

**Reset automático às 4h:**
- Ao abrir o app, compara `ultimoReset` com data atual (considerando 4h como corte)
- Se mudou o dia: salva histórico do dia anterior, reseta checks, hidratação e cardio
- 4h ao invés de meia-noite porque o usuário pode tomar algo tarde da noite
- **Edge case — app fechado por múltiplos dias:** salva histórico apenas do dia do `ultimoReset` (último dia com dados reais). Dias intermediários sem uso ficam sem dados (cinza no calendário). Não preenche dias fantasma.

**Toggle Dia Off:**
- Botão no header da tab Hoje
- Quando ativado: remove itens condicionais de treino (oxandrolona, intra treino, etc.)
- Recalcula total de itens do dia
- Permite marcar um dia de semana como off (ex: faltou treino na quarta)

### 8.2 Lógica Dia de Treino vs Dia Off

**Regras fixas:**
- Segunda a sexta: dia de treino
- Sábado e domingo: dia off
- Override manual via toggle (dia de semana → off)

**Itens condicionais:**

| Item | Regra |
|------|-------|
| Oxandrolona 40mg | Dias de treino, 1h pré treino |
| Anastrozol 0,5mg | Segunda e sexta, em jejum |
| Enantest 150mg + Masteron 100mg + Trembolona 75mg | Segunda, quarta e sexta |
| Intra treino (Intensity Hunter, Glutamina, Creatina, EAAs) | Apenas dias de treino |
| Abdômen | Dias de treino (opcional — não conta na aderência) |
| Panturrilha | Dias de treino (opcional — não conta na aderência) |

**Implementação:** Cada `ItemDoPlano` tem um campo `regra` opcional. Na montagem da checklist, filtra itens cuja regra não se aplica ao dia atual (considerando toggle manual). Itens com `opcional: true` são incluídos mas excluídos do cálculo de aderência.

### 8.3 Hidratação

**UI:**
- Card dentro da tab Hoje, abaixo das refeições
- Duas barras de progresso: Água (meta: 4000ml) e Chá de Cavalinha (meta: 500ml)
- Botões de incremento rápido: +250ml, +500ml (por tipo)
- Botão de decremento: -250ml (para corrigir toque acidental)
- Texto: "2.5L / 4L" com porcentagem
- Haptic feedback nos incrementos

**Lógica:**
- Incrementos/decrementos salvos no Zustand, persistidos via middleware
- Decremento não vai abaixo de 0
- Reseta às 4h junto com o resto
- Obs: Refrigerantes zero, Clight, gelatina zero e café preto NÃO contam na hidratação

**Notificação de hidratação:**
- Agendamento fixo a cada 2h entre 7h e 22h (8 notificações/dia)
- Reagendamento dinâmico: a cada incremento de água, cancela próximas notificações se meta atingida
- Sem avaliação de estado em background (limitação do Expo Go)

### 8.4 Cardio

**UI:**
- Card dentro da tab Hoje
- Meta: 80min/dia (preferencialmente dividir em 2 sessões)
- Input numérico para adicionar sessão (ex: 50min)
- Lista de sessões do dia com duração e botão de remover (swipe ou ícone X)
- Soma total visível (ex: "50min + 30min = 80min")
- Check automático quando total >= 80min
- Barra de progresso amber
- Haptic feedback ao adicionar sessão

**Lógica:**
- Array de sessões no Zustand
- Botão "Adicionar sessão" com input de minutos
- Remover sessão por índice (para corrigir erros)
- Reseta às 4h

### 8.5 Refeição Livre

**UI:**
- Indicador discreto no header ou topo da tab Hoje: "Refeição livre: 0/1"
- Quando disponível (dia de treino + não usada na semana): botão aparece em cada período de refeição
- Ao ativar: substitui visualmente os itens daquela refeição por "Refeição Livre"
- Os checks da refeição substituída são marcados automaticamente

**Lógica:**
- 1 por semana, reset toda segunda às 4h
- Disponível apenas em dias de treino
- `semanaRefeicaoLivre` guarda identificador da semana atual pra saber quando resetar
- `refeicaoLivrePeriodoId` guarda qual período foi substituído (necessário pra saber quais checks auto-marcar e pra exibir corretamente)
- Obs do personal: "Não exagere na refeição livre, se extrapolar o saldo calórico pode comprometer os resultados da semana."

### 8.6 Consulta de Treino

**UI:**
- Tab dedicada
- Header: dia da semana + nome do treino (ex: "Segunda — A: Peito")
- Lista de exercícios com:
  - Nome do exercício
  - Séries: WS (working set), TS (top set), BS (back-off set), CS (cluster set)
  - Observações (ex: "1seg pico de contração", "banco 45° com peito apoiado")
- Seção colapsável "Dicas de Treino" com orientações do personal e legenda de séries
- Apenas leitura, sem input

**Rotação:**
- A (Peito) → B (Costas) → C (Pernas) → D (Ombros) → E (Braços)
- Segue seg→sex automaticamente
- Em dia off: mostra "Dia Off — Descanse" ou o próximo treino

**Dados hardcoded:**

```typescript
type Serie = {
  tipo: "WS" | "TS" | "BS" | "CS";
  series: number;
  reps: string;        // "8-12", "5-8", "15"
  observacao?: string;  // "4+4+4", "5+5+5/10seg"
};

type Exercicio = {
  nome: string;
  series: Serie[];
  observacao?: string;  // "1seg pico de contração", "banco 45° com peito apoiado"
};

type Treino = {
  id: string;          // "A", "B", "C", "D", "E"
  nome: string;        // "Peito", "Costas", "Pernas", "Ombros", "Braços"
  exercicios: Exercicio[];
};
```

### 8.7 Notificações Locais

**Tipo 1 — Lembrete por período:**
- Notificação agendada no horário base de cada refeição/período
- Texto: "Refeição 1 — 8 itens pendentes"
- Toque abre o app via deep link para a seção correspondente (Expo Router URL scheme)
- Configurável: toggle on/off + horário por período

**Tipo 2 — Lembrete de hidratação:**
- Agendamento fixo a cada 2h entre 7h e 22h
- Reagendado dinamicamente quando o usuário registra água (cancela se meta atingida)
- Texto: "Hidratação: 1.5L / 4L — bora beber água"
- Configurável: toggle on/off + intervalo

**Implementação:**
- `expo-notifications` com scheduling local
- Permissão solicitada no primeiro uso
- Reagendar notificações quando config mudar
- Cancelar notificação de um período se todos os itens já foram checked

### 8.8 Histórico & Aderência

**Calendário mensal:**
- Grid de dias estilo calendário
- Cores por dia:
  - Verde (`#22c55e`): 100% dos itens completados
  - Amber (`#f59e0b`): 50-99% completados
  - Vermelho (`#ef4444`): <50% completados
  - Cinza (`#404040`): sem dados / dia futuro
- Navegar entre meses (setas)
- Toque no dia abre detalhes (itens perdidos)

**Stats Card (fixo abaixo do calendário):**
- Streak atual: "12 dias consecutivos 100%"
- Aderência semanal: "87% esta semana"
- Aderência mensal: "92% em fevereiro"
- Top 3 itens mais esquecidos: lista com nome do item + % de dias esquecido
  - Calculado a partir do array `itensPerdidos` do histórico

**Detalhe do dia (bottom sheet ao tocar no dia):**
- Data e status (completo/parcial)
- Barra de progresso
- Lista de itens perdidos naquele dia

**Nota:** Itens opcionais (abdômen, panturrilha) não entram no cálculo de aderência nem aparecem como "itens perdidos".

---

## 9. Persistência & Hidratação de Estado

### Estratégia: Zustand + AsyncStorage Middleware

```
App abre → Zustand hydrate do AsyncStorage → estado em memória
                                                    ↓
                                              Qualquer mutação
                                                    ↓
                                        Middleware persiste automaticamente
                                              no AsyncStorage
```

**Stores separadas (todas usando Zustand persist middleware):**

| Store | Conteúdo | Reset |
|-------|----------|-------|
| `useDayStore` | checks, hidratação, cardio, dia off, refeição livre | Diário às 4h (exceto refeição livre: semanal) |
| `useHistoryStore` | histórico por dia | Nunca (append-only) |
| `useConfigStore` | toggles e horários de notificação | Nunca (user config) |

**Middleware persist do Zustand:**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useDayStore = create(
  persist(
    (set, get) => ({
      // ...state e actions
    }),
    {
      name: 'day-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Lógica de reset (4h):**
- Executada no `onRehydrateStorage` callback do middleware persist
- Compara `ultimoReset` com data atual (usando 4h como corte)
- Se dia mudou: salva histórico do dia anterior → reseta estado
- Se segunda e semana mudou: reseta refeição livre
- Se `ultimoReset` é mais de 1 dia atrás: salva histórico apenas do dia do `ultimoReset` (último dia com dados reais). Dias intermediários ficam sem dados (cinza no calendário).

---

## 10. Estrutura de Pastas

```
planTracker/
├── app/                          # Expo Router
│   ├── _layout.tsx               # Root layout (tabs)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── index.tsx             # Tab Hoje
│   │   ├── treino.tsx            # Tab Treino
│   │   └── historico.tsx         # Tab Histórico
│   └── config.tsx                # Modal de config
├── components/
│   ├── checklist/
│   │   ├── PeriodoSection.tsx    # Seção colapsável de período
│   │   ├── CheckItem.tsx         # Item individual com check
│   │   └── ProgressBar.tsx       # Barra de progresso
│   ├── hidratacao/
│   │   ├── HidratacaoCard.tsx    # Card de hidratação
│   │   └── IncrementButton.tsx   # Botão +250ml/+500ml/-250ml
│   ├── cardio/
│   │   └── CardioCard.tsx        # Card de cardio
│   ├── treino/
│   │   └── ExercicioItem.tsx     # Item de exercício
│   ├── historico/
│   │   ├── Calendario.tsx        # Grid de calendário
│   │   ├── StatsCard.tsx         # Card de stats
│   │   └── DiaDetalhe.tsx        # Bottom sheet de detalhe
│   ├── dicas/
│   │   └── DicasSection.tsx      # Seção colapsável de dicas
│   └── ui/
│       ├── Card.tsx              # Card base
│       └── Badge.tsx             # Badge/indicador
├── data/
│   ├── plano.ts                  # Plano de dieta/suplementos hardcoded
│   ├── treinos.ts                # Treinos A-E hardcoded
│   └── dicas.ts                  # Dicas de nutrição e treino hardcoded
├── stores/
│   ├── useDayStore.ts            # Estado do dia (checks, hidratação, cardio)
│   ├── useHistoryStore.ts        # Histórico de aderência
│   └── useConfigStore.ts         # Config de notificações
├── utils/
│   ├── diaUtils.ts               # Lógica dia treino/off, filtro de itens
│   ├── resetUtils.ts             # Lógica de reset às 4h
│   └── notificationUtils.ts     # Scheduling de notificações
├── constants/
│   └── theme.ts                  # Cores, espaçamentos
├── docs/
│   └── plans/
│       └── 2026-02-25-daily-tracker-prd.md
└── app-requirements.md
```

---

## 11. Paleta de Cores

```typescript
const theme = {
  bg: {
    primary: '#0c0a09',     // Stone 950 — fundo principal
    card: '#1c1917',        // Stone 900 — cards e seções
    elevated: '#292524',    // Stone 800 — elementos elevados
  },
  accent: {
    primary: '#f59e0b',     // Amber 500 — accent principal
    primaryMuted: '#92400e', // Amber 800 — accent sutil
  },
  semantic: {
    success: '#22c55e',     // Green 500 — checkmarks only
    warning: '#f59e0b',     // Amber 500 — parcial
    error: '#ef4444',       // Red 500 — <50%
  },
  text: {
    primary: '#fafaf9',     // Stone 50
    secondary: '#a8a29e',   // Stone 400
    muted: '#78716c',       // Stone 500
  },
  border: '#292524',        // Stone 800
};
```

---

## 12. Dev & Deploy

**Desenvolvimento:**
- `npx expo start` → QR code → Expo Go no iPhone
- Hot reload automático ao salvar arquivos
- Sem Apple Developer Account necessária

**Atualização mensal do plano:**
- Editar `data/plano.ts`, `data/treinos.ts` e/ou `data/dicas.ts`
- Salvar → hot reload atualiza no celular instantaneamente
- Sem rebuild, sem deploy

**Libs principais:**

| Lib | Uso |
|-----|-----|
| expo | Framework |
| expo-router | Navegação (file-based) |
| expo-notifications | Notificações locais |
| expo-haptics | Feedback tátil |
| @react-native-async-storage/async-storage | Persistência |
| zustand | Estado global com middleware persist |
| nativewind | Styling (Tailwind CSS) |

**Nota:** Versões das libs devem ser validadas contra o Expo SDK instalado no momento da implementação (`npx expo install` resolve automaticamente).

---

## 13. Fora de Escopo (v1)

- Widget iOS (requer build nativo)
- Notas/observações por dia
- Fotos de refeições
- Exportação PDF/texto
- Tracking de carga/repetições no treino
- Backend/sync/auth
- Multi-usuário
