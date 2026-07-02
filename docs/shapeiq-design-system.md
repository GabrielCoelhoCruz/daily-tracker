# ShapeIQ — Full UX/UI Design System
*Seu prep. Seu shape. Com IA.*

> **Versão:** 1.1 — PT-BR naming, onboarding, protocolo import, linguagem IA suavizada, specs Figma executáveis.

---

## 0. Narrativa do produto (north star)

**ShapeIQ não é onde o atleta registra dados de fitness — é onde ele prova se o prep foi executado.**

O loop central do produto:

```
Executar → Fechar o dia → Detectar vazamento → Comparar shape → Ajustar com evidência
```

| Etapa | Superfície | Pergunta |
|:---|:---|:---|
| Executar | Hoje · Protocolo · Treino | O que faço agora? |
| Fechar o dia | Hoje (Fechamento) | Quanto do plano foi cumprido? |
| Detectar vazamento | Logs (Revisão) | Onde a execução escapou? |
| Comparar shape | Evidências | O shape mudou de verdade? |
| Ajustar com evidência | Evidências + coach | O que os dados sugerem? |

Toda decisão de UX/UI deve reforçar esse loop — não adicionar rastreamento por rastreamento.

---

## 1. Executive Summary

ShapeIQ is a prep command center for competitive bodybuilders — not a habit tracker, not a gym log. The design treats the athlete like a pilot mid-flight: one clear next action at all times, instrument-grade data readouts, and honest AI feedback with visible limitations. The chosen direction, **Instrument Panel**, uses a near-black carbon surface system, a single amber "gauge" accent, monospaced data typography, and semantic score colors to make execution state legible at arm's length in a dark gym.

Every screen answers exactly one question (Hoje: "o que faço agora?"; Logs: "onde estou vazando?"; Evidências: "que evidência mostra mudança no shape?"). Every number is evidence-backed — scores link to the actions that produced them, AI signals ship with disclaimers, and celebration is earned, never decorative.

**Idioma da UI:** português brasileiro em todas as superfícies visíveis ao usuário. Termos em inglês ficam restritos a nomes internos de componentes (§3.1).

---

## 2. Creative Direction

### Direction 1 — Instrument Panel (RECOMMENDED)
- **Mood:** cockpit at night. Carbon fiber, aviation gauges, amber HUD readouts on near-black. Swiss precision meets motorsport telemetry. Dense but never cluttered — every pixel is data or breathing room.
- **Palette:** `#0C0A09` base, `#1C1917` surfaces, `#F59E0B` amber primary, `#22C55E` / `#EAB308` / `#EF4444` semantic, `#A8A29E` muted text.
- **Type pairing:** SF Pro Display (titles) + SF Pro Text (body) + **SF Mono** (all scores, weights, timers, percentages).
- **Why it wins:** the persona wants rigor. Amber-on-black reads perfectly in gym lighting, mono digits give scores the gravity of instruments, and the restrained palette makes semantic color (green/yellow/red) unmissable.

### Direction 2 — Stage Lights (not chosen)
- Reserved for **Resultado IA** hero photo only — subtle spotlight, not app-wide.

**Instrument Panel applied to all deliverables below.**

---

## 3. Design Foundation

### 3.1 Glossário PT-BR (UI vs interno)

| Nome interno (doc / Figma / código) | Label na UI (PT-BR) |
|:---|:---|
| Command Center | **Hoje** |
| Daily Protocol | **Protocolo** |
| Training Session | **Treino** |
| Prep Review / Leak Map | **Logs** (subtítulo: *Revisão do prep*) |
| Evidence Board | **Evidências** |
| Stage Readiness | **Leitura de palco** |
| Category Finder | **Categorias** |
| Set Logger | **Registro de séries** |
| Rest Timer | **Descanso** |
| Score bars | **Barras de leitura** (por grupo muscular) |
| Leak | **Vazamento** (introduzido com copy de apoio — §8) |
| Closeout | **Fechamento do dia** |
| Check-in | **Check-in** (termo aceito no nicho) |

**Abas (definitivo):** **Hoje · Protocolo · Treino · Logs · Evidências**

Alternativa mais coloquial (não adotada): *Hoje · Plano · Treino · Revisão · Shape*

### Brand personality
**Preciso · Sério · Direto · Confiável · Implacável (com carinho de coach)**

Anti-patterns — ShapeIQ must NOT feel like:
- Gamified habit app (no confetti rain, no mascots, no streak flames)
- Wellness pastel ("self-care" gradients, rounded bubbly type)
- Hype-AI ("nossa IA revolucionária" — never; AI is a lab instrument with error bars)
- Social fitness (no feeds, likes, or sharing pressure)
- Generic calorie counter (no food database browsing UI)
- **Juiz virtual** — a IA detecta sinais, não emite veredito oficial

### Design tokens

| Token | Value | Use |
|:--|:--|:--|
| `bg/base` | `#0C0A09` | App background |
| `bg/surface` | `#1C1917` | Cards |
| `bg/surface-2` | `#292524` | Nested elements, inputs |
| `border/subtle` | `#292524` @ 1px | Card strokes |
| `border/focus` | `#F59E0B` @ 1.5px | Active/current states |
| `accent/primary` | `#F59E0B` | CTAs, current set, next action |
| `accent/primary-dim` | `#F59E0B` @ 15% | Accent fills, chips |
| `semantic/success` | `#22C55E` | Score ≥ 85, done states |
| `semantic/warning` | `#EAB308` | Score 60–84, stale data |
| `semantic/error` | `#EF4444` | Score < 60, vazamentos |
| `text/primary` | `#FAFAF9` | Titles, values |
| `text/secondary` | `#A8A29E` | Labels, captions |
| `text/tertiary` | `#57534E` | Disabled, placeholders |
| `type/display` | SF Pro Display Bold 34/40 | Score heroes |
| `type/title-1` | SF Pro Display Bold 24/30 | Screen titles |
| `type/title-2` | SF Pro Display Semibold 18/24 | Card titles |
| `type/body` | SF Pro Text Regular 16/22 | Content |
| `type/caption` | SF Pro Text Medium 13/18 | Labels (often uppercase +0.5 tracking) |
| `type/data-lg` | SF Mono Bold 40/44 | Hero scores, timer |
| `type/data` | SF Mono Semibold 17/22 | Inline metrics (kg, ml, min, %) |
| `space` | 4 / 8 / 12 / 16 / 24 / 32 | 4pt grid; 16 screen gutter |
| `radius` | 12 (cards) / 10 (buttons) / 8 (chips) / full (progress, avatar) | |
| `elevation` | No drop shadows; hierarchy via surface steps + 1px borders. Glass only on tab bar + sticky footers | iOS-native |
| `tap-target` | ≥ 48pt; ≥ 56pt in Treino | Gym gloves |

### Layout constants (Figma / implementação)

| Constante | Valor | Notas |
|:---|:---|:---|
| Frame | **393 × 852** | iPhone 15 Pro logical; safe area top ~59, bottom ~34 |
| Screen gutter | 16px horizontal | All scroll content |
| Section gap | 24px | Between major cards on Hoje |
| Card internal padding | 20px | Briefing, fechamento |
| Tab bar height | 83px | Incl. home indicator; glass material |
| Nav bar (large title) | ~96px collapsed → ~44px | iOS native stack |
| Sticky footer (Evidências) | 72px + safe area | "Novo check-in" when stale |
| Briefing card min-height | ~220px | Hero CTA always visible without scroll on first paint |
| Metric tile | ~96px height | 2-col grid, gap 12 |
| Checklist row | 48px min | 56px in Treino controls |
| Set logger hero | ~340px | Active session primary interaction |
| Rest timer ring | 120px diameter | Replaces logger card slot |

### Iconography
SF Symbols, `medium` weight. Tabs: `sun.max` (Hoje), `checklist` (Protocolo), `dumbbell` (Treino), `chart.bar.doc.horizontal` (Logs), `camera.metering.matrix` (Evidências).

Vazamento types: fork.knife (refeição), drop (hidratação), figure.run (cardio), dumbbell (treino), camera (check-in).

### Motion
- **Check-off:** checkbox fills amber→green, 150ms spring, light haptic. Row dims, no strikethrough.
- **Set complete:** card slide 250ms, volume counter rolls up.
- **Descanso:** circular countdown; 3s pulse + haptic; completion = success haptic.
- **Fechamento:** score 0→N in 600ms mono; ≥85 = single amber sweep (única celebração diária).
- **Reduce Motion:** springs → crossfades; count-ups → instant.

---

## 4. Component Library (key specs)

Component Figma naming: `cmp/{name}/{variant}` — e.g. `cmp/briefing-card/default`, `cmp/metric-tile/behind`.

**Tab bar** — 5 tabs, glass, active amber. Badge on Protocolo (pending in current period); on Hoje when fechamento disponível.

**Briefing Card (`cmp/briefing-card`)** — surface card ~220px. Date + phase chip ("Semana 9 · Cutting"), context "Treino C · Pernas", **ONE** hero CTA (amber, 56pt, full-width). Variants: `default`, `complete`, `rest-day`.

**Metric Card (`cmp/metric-tile`)** — ~96×flex 1. Caption, mono value, micro bar. Variants: `on-track`, `behind`, `missed`, `na-rest`.

**Checklist Row (`cmp/checklist-row`)** — 48pt. Variants: `pending`, `done`, `skipped`, `hidden`.

**Period Header (`cmp/period-header`)** — sticky; current period = amber 3px left rail.

**Hydration (`cmp/hydration-control`)** — mono "1.750 / 3.000 ml", ±250ml @ 56pt, Água | Chá.

**Cardio (`cmp/cardio-control`)** — mono "45 / 90 min", chips 10/15/20/30.

**Registro de séries (`cmp/set-logger`)** — amber border ~340px. WS/TS/BS/CS badges, steppers 64pt, "CONCLUIR SÉRIE".

**Descanso (`cmp/rest-timer`)** — replaces logger; ring 120px, mono 40pt, +30s / Pular.

**Calendar cell (`cmp/calendar-day`)** — 40×40, radius 8. Variants: `empty`, `scored`, `today`, `future`.

**Photo grid (`cmp/photo-slot-grid`)** — 2×2, dashed empty + silhouette ghost.

**Barras de leitura (`cmp/muscle-score-bar`)** — horizontal + delta chip + link "Limitações".

**Vazamento chip (`cmp/leak-chip`)** — icon + label + count; variants by type.

**States:** `cmp/empty-state`, `cmp/error-state`, `cmp/offline-banner` (AI queue only).

---

## 5. Screen-by-Screen Specs

Sample data convention: use **Semana 9 · Cutting**, **Treino C · Pernas**, execução **73%**, água **1.750/3.000 ml**, cardio **45/90 min**, **12/18** protocolo.

### 5.1 Hoje
- **Header:** "Hoje" + date; gear → Configurações.
- **Scroll (gap 24):** Briefing → Metrics 2×2 → Treino hoje → Protocolo compacto → Fechamento.
- **Variants needed:** `Default`, `Closable`, `DayOff`, `AllComplete`, `EmptyFirstDay`.
- **Closeout:** all-clear → "Fechar o dia"; pending → "Voltar para executar" + "Fechar mesmo assim" (≥21h).

### 5.2 Protocolo
- **Header:** progress 12/18 + bar; Dia off + refeição livre chip.
- **Scroll:** period sections + hidratação + cardio.
- **Variants:** `Default`, `DiaOff`, `RefeicaoLivreActive`, `EmptyPlan` (see §11).
- Auto-scroll to current period.

### 5.3 Treino
- **Variants:** `Rest`, `DayOff`, `PreSession`, `Active`, `RestTimer`, `Summary`.
- **Active:** header volume + elapsed; Registro de séries OR Descanso; exercise list below.

### 5.4 Logs (Revisão do prep)
- **Header:** week selector ‹ Semana 9 ›.
- **Scroll:** weekly score hero → principal vazamento → calendar → recent days.
- **Copy intro vazamento:** "Onde sua execução escapou esta semana" (card subtitle).
- **Variants:** `Default`, `SolidWeek`, `Empty`.

### 5.5 Detalhe do dia
- Read-only closeout + treino summary. Variant: `WithNote`, `WithoutTraining`.

### 5.6 Evidências (tab; antes "Stats")
- **Scroll:** ① **Leitura de palco** hero — labels suaves (§7), never "palco-ready" ② Último sinal IA ③ Snapshot (fotos + peso + freshness) ④ Contexto de execução (7 dias) ⑤ Gráfico evolução ⑥ Timeline check-ins ⑦ Grid ações.
- **Sticky footer:** "Novo check-in" when >7d stale.
- **Variants:** `Default`, `Empty`, `Stale`, `OfflineQueue`.

**Leitura de palco — labels permitidos (PT-BR):**
- Evolução em andamento
- Condição competitiva
- Sinal forte para palco
- Ainda precisa lapidar

**Proibido na UI:** Palco-ready, Stage-ready, "Você está pronto", veredito de juiz.

### 5.7 Novo check-in (modal)
Steps: Modo → Captura → Dados → Revisar. Variants per step + `OfflineQueued`.

### 5.8 Resultado IA
Spotlight photo + sinal + evidências + barras de leitura + **limitações sempre visíveis** (§8).

### 5.9 Comparar semanas
Week pickers + synced photos. Variant: `MissingAngle`.

### 5.10 Categorias
13 IFBB/NPC rows + detail. Variant: `ProfileIncomplete` (blocking).

### 5.11 Perfil do atleta
Identidade · Medidas · Prep · Coach. Required before Categorias + IA full mode.

### 5.12 Configurações
Grouped list: Perfil, Notificações, Check-in reminders, Demo, Sobre.

---

## 6. Onboarding (Primeira configuração)

**Gatilho:** first launch OR perfil incompleto OR plano vazio.

**Objetivo:** without this, Hoje cannot compute next action reliably.

| Step | Título (PT-BR) | Captura | Bloqueia |
|:---:|:---|:---|:---|
| 0 | Boas-vindas | Value prop + loop Executar→Fechar→Vazamento→Evidência | — |
| 1 | Perfil competitivo | Nome, gênero (categorias), altura, peso | Categorias, IA posing |
| 2 | Campeonato / meta | Data do show, fase (cutting/bulk/…), semanas restantes (auto) | Leitura de palco context |
| 3 | Coach | Tem coach? Nome/contato (opcional) | — |
| 4 | Protocolo do dia | **Como você recebe seu plano?** (§11) | Protocolo tab content |
| 5 | Treino semanal | Split A–E ou import | Treino tab |
| 6 | Metas | Água, chá, cardio min/dia | Métricas Hoje |
| 7 | Check-in | Frequência semanal sugerida + primeiro check-in opcional | Evidências freshness |
| 8 | Pronto | Resumo + CTA "Ir para Hoje" | — |

**UX:** progress bar top; skip only where safe (coach optional); drafts saved per step; can resume from Configurações → "Completar configuração".

**Figma frames:** `Onboarding/0-Welcome` … `Onboarding/8-Ready`, plus `Onboarding/ResumeIncomplete`.

---

## 7. UX Rules

**Navigation:** 5 tabs only. Push = drill-down. Sheet = bounded tasks (check-in, config, onboarding step).

**Next action (deterministic):** 1) overdue protocol item → that item; 2) treino pending in window → iniciar treino; 3) hydration <60% pro-rated → beber água; 4) cardio remaining post-treino → cardio; 5) after 21h all resolved → fechar o dia; 6) idle → "Tudo em dia. Próximo: {periodo} às {hora}." **One CTA.**

**Fechamento:** ready = non-optional resolved + treino resolved. Before 21h: only "Voltar para executar". After 21h: "Fechar mesmo assim" → unresolved become vazamentos.

**Vazamentos vs vitórias:** vazamentos only after fechamento. Mid-day = next action only. Intro copy: **"Principal vazamento"** + subtitle **"Onde sua execução escapou esta semana"**.

**IA transparency:** observational verbs only ("aparenta", "sugere", "em comparação com"). Never diagnostic ("seu bodyfat é", "você está pronto para palco"). Every result: evidência + limitações visíveis. Ban: revolucionário, mágico, perfeito, garantido, palco-ready.

**Accessibility:** contrast ≥4.5:1; semantic color + icon; Dynamic Type; Reduce Motion; VoiceOver labels in PT-BR.

---

## 8. Copy Deck (PT-BR)

**Tabs:** Hoje · Protocolo · Treino · Logs · Evidências

**Primary CTAs:** Fechar o dia · Voltar para executar · Iniciar sessão · Concluir série · Pular descanso · Novo check-in · Enviar para análise · Comparar semanas · Usar refeição livre · Colar plano do coach · Salvar

**Vazamento copy:**
- Card title: **Principal vazamento**
- Subtitle: **Onde sua execução escapou esta semana**
- Empty week win: **Semana sólida. Nenhum vazamento dominante.**

**Leitura de palco labels:** Evolução em andamento · Condição competitiva · Sinal forte para palco · Ainda precisa lapidar

**Empty states:**
- Logs: "Sem dias fechados ainda. Feche seu primeiro dia na aba Hoje."
- Evidências: "Nenhum check-in ainda. Evidência começa com a primeira foto."
- Treino off: "Dia off ativado. Treino e itens de treino pausados hoje."
- Comparar: "Você precisa de pelo menos 2 check-ins para comparar."
- Protocolo vazio: "Seu protocolo ainda não foi configurado. Importe o plano do coach ou use o modo demo."

**Freshness:** "Há {n} dias" · >7d warning · >14d urgent

**AI disclaimer (sempre visível em Resultado IA):**
> "Esta análise é gerada por IA a partir das suas fotos e não substitui a avaliação do seu coach ou juiz. Iluminação, pose e ângulo afetam o resultado. Use como evidência de tendência, não como veredito."

**Contexto de execução (Evidências):** "Aderência dos últimos 7 dias — contexto do seu prep, não causa direta do resultado."

**Skip reason sheet:** Sem tempo · Sem fome/apetite · Imprevisto · Escolha própria

---

## 9. Protocolo — origem do plano (gap de produto)

O doc anterior assumia que o protocolo já existe. Em produção, isso precisa ser resolvido **antes** do Protocolo ser útil.

### Quem cria o protocolo?

| Opção | UX | Prioridade sugerida |
|:---|:---|:---:|
| **Colar plano do coach** | Textarea / paste WhatsApp → IA estrutura refeições, suplementos, horários, cardio | P0 killer |
| Template demo | Modo demo pré-carregado (já existe no app) | P0 |
| Manual | CRUD de períodos e itens | P1 |
| Import PDF / foto | OCR + estruturação | P2 |
| Coach compartilha link | Futuro B2B | P3 |
| Plano semanal repetido | Clone week → week | P1 |

### Fluxo "Colar plano do coach" (diferencial)

1. Onboarding step 4 OR Configurações → "Importar protocolo"
2. Paste raw text (WhatsApp export, lista do coach)
3. Preview estruturado: períodos, itens, condicionais (dia de treino)
4. Confirmar metas (água, chá, cardio)
5. Persist local → Protocolo tab populated

**Empty Protocolo state** until step complete — Hoje shows CTA "Configurar protocolo" instead of checklist.

---

## 10. Key Flows

**F0 Onboarding:** Welcome → Perfil → Show → Coach → Import protocolo → Split → Metas → Check-in opcional → Hoje.

**F1 Morning:** Hoje → hero CTA → Protocolo (period scrolled) → check → Hoje recalculates.

**F2 Training:** Hoje → Treino → sessão → registro de séries ↔ descanso → resumo → Hoje ✓.

**F3 Fechamento (21h+):** notification → Fechamento → nota → Fechar → Logs.

**F4 Check-in:** Evidências → Novo check-in → captura → fila IA → Resultado → Comparar.

**F5 Revisão semanal:** Logs → vazamento → dias filtrados → Detalhe → ajuste mental para semana seguinte.

---

## 11. Differentiation

- **vs MyFitnessPal:** prescribed protocol executed, not food database.
- **vs Strong/Hevy:** single guided rail — one set, one button.
- **vs RP:** adherence intelligence, not algorithmic diet changes.
- **vs habit trackers:** no streaks; score = execution evidence; vazamentos nomeados.
- **ShapeIQ-only:** fechamento diário, taxonomia de vazamento, leitura de palco com confiança qualitativa, IA com limitações visíveis, **importar plano do coach**.

---

## 12. Figma Structure (executável)

### File setup
- Device: **iPhone 15 Pro 393×852**
- Layout grid: 16px margin, 12px column gutter (2-col metrics)
- Variables: mirror §3 tokens exactly

### Pages
- **📄 00 Foundation** — colors, type scale, spacing, motion, layout constants table
- **📄 01 Components** — `cmp/*` with all variants listed §4
- **📄 02 Screens — Tabs** — see frame list below
- **📄 03 Flows** — Onboarding 0–8, CheckIn 1–4, F1–F5 prototypes
- **📄 04 Samples** — sample data JSON per screen for Figma AI / handoff

### Required frames (minimum set)

| Frame | Variants |
|:---|:---|
| `shapeiq/hoje/` | default, closable, day-off, all-complete, empty-first-day |
| `shapeiq/protocolo/` | default, dia-off, refeicao-livre, **empty-plan** |
| `shapeiq/treino/` | rest, day-off, pre-session, active, rest-timer, summary |
| `shapeiq/logs/` | default, solid-week, empty |
| `shapeiq/evidencias/` | default, empty, stale, offline-queue |
| `shapeiq/onboarding/` | 0-welcome … 8-ready |
| `shapeiq/checkin/` | 1-modo, 2-captura, 3-dados, 4-enviar, offline |
| `shapeiq/resultado-ia/` | default (limitações expanded) |
| `shapeiq/import-protocolo/` | paste, preview, confirm |

### Screen states checklist

| State | Screens |
|:---|:---|
| Empty | Logs, Evidências, Protocolo, Comparar |
| Offline / queue | Novo check-in, Resultado IA pending |
| Blocked | Categorias (perfil incompleto), Hoje (protocolo vazio) |
| Locked | Detalhe do dia (pós-fechamento), fechamento edit note 24h |

### Sample data (Hoje/default)
```
date: "Quarta-feira, 1 de julho"
phase: "Semana 9 · Cutting"
context: "Treino C · Pernas"
nextAction: "Marcar pré-treino"
metrics: { refeições: "3/5", água: "1.750/3.000 ml", cardio: "45/90 min", treino: "Pendente" }
protocolo: "12/18"
fechamento: { score: 73, leaks: ["Cardio −45 min"] }
```

---

## 13. Changelog

| Versão | Mudanças |
|:---|:---|
| 1.0 | Spec inicial Instrument Panel |
| 1.1 | Stats→Evidências; glossário PT-BR; IA suavizada; onboarding §6; protocolo import §9; layout Figma §3 + §12; narrativa §0; copy vazamento |
