# ShapeIQ Launch Video — Production Package

Vertical 9:16 · 60s (PT-BR) + 20s cut · Dark premium iOS · Gym + code

---

## 1. Roteiro final com timestamps

| Tempo | Cena | Overlay | VO |
|-------|------|---------|-----|
| 0:00–0:04 | Hook | Apps fitness não entendem prep. | Todo app fitness que eu testei parecia feito pra gente casual. |
| 0:04–0:09 | Dor | Dieta. Cardio. Treino. Check-in. | Mas em bodybuilding prep, errar execução muda tudo. |
| 0:09–0:13 | Virada | Então eu construí o meu. | Então eu construí o ShapeIQ. |
| 0:13–0:17 | Marca | ShapeIQ / Sua prep. Seu shape. Com IA. | Um app iOS de prep, feito para acompanhar rotina, físico e evolução competitiva. |
| 0:17–0:23 | Today Briefing | Today Briefing | A home mostra o que importa agora e qual é a próxima ação do dia. |
| 0:23–0:29 | Training | Training Session | O treino vira uma sessão guiada, não uma lista parada. |
| 0:29–0:35 | Logs | Prep Review | Os logs mostram padrões: onde estou consistente e onde estou vazando execução. |
| 0:35–0:44 | IA | Physique Intelligence | E a parte principal: IA analisando check-ins físicos com critérios competitivos. |
| 0:44–0:51 | Tech | Expo · React Native · TypeScript · Claude Vision | Feito com Expo, React Native, TypeScript, Zustand e Claude Vision. |
| 0:51–0:58 | Fechamento | ShapeIQ / Sua prep. Seu shape. Com IA. | Não é só um side project. É o app que eu queria usar na minha própria preparação. |
| 0:58–1:00 | CTA | ShapeIQ / GitHub: GabrielCoelhoCruz | ShapeIQ. Built for prep. Built as portfolio. |

---

## 2. Voiceover completo

Ver `SCRIPT.md` — 11 linhas, ~58s de fala, pausas de corte entre cenas.

---

## 3. Text overlays por cena

| Cena | Linha 1 | Linha 2 |
|------|---------|---------|
| 1 | Apps fitness | não entendem prep. |
| 2 | Dieta. Cardio. | Treino. Check-in. |
| 3 | Então eu | construí o meu. |
| 4 | ShapeIQ | Sua prep. Seu shape. Com IA. |
| 5 | Today Briefing | — |
| 6 | Training Session | — |
| 7 | Prep Review | — |
| 8 | Physique Intelligence | — |
| 9 | Expo · React Native | TypeScript · Claude Vision |
| 10 | ShapeIQ | Sua prep. Seu shape. Com IA. |
| 11 | ShapeIQ | GitHub: GabrielCoelhoCruz |

Regra: máximo 5–7 palavras por tela. Fonte Inter/SF, branco `#e8e1df`, destaque amber `#f59e0b`.

---

## 4. Shot list

### A-roll (Gabriel)
| ID | Shot | Duração | Notas |
|----|------|---------|-------|
| A1 | Close rosto espelho gym, luz baixa | 2s | Hook — suor, intensidade |
| A2 | Treino pesado (agachamento/supino) | 3s | B-roll dor + fechamento |
| A3 | Cardio (esteira/bike) | 2s | Cena 2 |
| A4 | Marmitas / meal prep | 2s | Cena 2 |
| A5 | Garrafa d'água + hidratação | 1s | Cena 2 |
| A6 | Check-in físico (espelho, pose) | 2s | Cena 2 + 8 |
| A7 | Anotações / plano no celular | 1s | Cena 2 |
| A8 | Codando VS Code, mãos no teclado | 3s | Cena 3 + 9 |
| A9 | Terminal com testes passando | 2s | Cena 9 |
| A10 | Fechando notebook pós-treino | 2s | Cena 10 |

### B-roll app (screen recording iPhone)
| ID | Tela | Arquivo | Duração |
|----|------|---------|---------|
| B1 | Today Briefing (home) | `(hoje)/index` | 6s |
| B2 | Training Session | `(treino)/index` | 6s |
| B3 | Prep Review | `(historico)/index` | 6s |
| B4 | Physique Intelligence | `(progresso)/index` | 5s |
| B5 | AI check-in result | `(progresso)/result` | 4s |
| B6 | 4 abas overview | tab bar scroll | 3s |

**Gravação:** iPhone real ou simulador iOS 18, dark mode, dados demo realistas (nunca empty state). Ocultar API keys, e-mails, tokens.

### B-roll tech
| ID | Shot | Notas |
|----|------|-------|
| T1 | VS Code — `app/(tabs)/` ou componente training | syntax highlight TS |
| T2 | Terminal `npm test` verde | sem paths sensíveis |
| T3 | GitHub README ShapeIQ | scroll lento |
| T4 | Stack badges (Expo, RN, TS, Claude) | overlay ou insert |

### Transições
- Cortes secos (cut) entre gym ↔ app ↔ código
- Crossfade 4 frames só em marca e fechamento
- Whoosh SFX leve nos cortes (opcional, ver música)

---

## 5. Lista de assets necessários

### Footage real (Gabriel)
- [ ] Treino pesado — gym, luz quente baixa
- [ ] Espelho / check-in físico
- [ ] Marmitas / meal prep
- [ ] Garrafa d'água
- [ ] Cardio
- [ ] Codando (VS Code + monitor)
- [ ] Terminal testes passando
- [ ] Fechando notebook / pós-treino

### Capturas do app
- [ ] Today Briefing (home com próxima ação)
- [ ] Training Session (current lift + progress)
- [ ] Prep Review (calendário + aderência)
- [ ] Physique Intelligence (stage readiness + scores)
- [ ] AI check-in result screen
- [ ] iPhone mockup — 4 abas

### Prova técnica
- [ ] GitHub README (repo público)
- [ ] Terminal `npm test` green
- [ ] Stack badges PNG/SVG
- [ ] Snippet TypeScript (Claude Vision route — sem secrets)
- [ ] App icon 1024px (`assets/images/icon.png`)

### Audio
- [ ] Voiceover PT-BR gravado ou TTS (`npx hyperframes tts`)
- [ ] BGM dark/cinematic (ver seção 10)
- [ ] SFX: whoosh cuts, subtle impact nos títulos

### HyperFrames (já iniciado)
- [x] `videos/shapeiq-launch/` — composição 60s protótipo
- [x] `videos/shapeiq-launch-short/` — versão 20s
- [ ] Substituir mockups CSS por screen recordings reais na edição final

---

## 6. Legenda TikTok / Reels (PT-BR)

```
Eu não queria mais um app fitness.

Eu precisava de um app que entendesse bodybuilding prep:
dieta, hidratação, cardio, treino, check-ins e evolução de físico.

Então construí o ShapeIQ.

Um app iOS feito com Expo, React Native, TypeScript, Zustand e Claude Vision — usando IA para analisar check-ins físicos com lógica competitiva.

Sua prep. Seu shape. Com IA.

Built for my prep.
Built as my portfolio.
```

---

## 7. Legenda LinkedIn (EN)

```
I built ShapeIQ because generic fitness apps don't understand competitive bodybuilding prep.

During prep, the problem is not just tracking workouts.
It is:
- meal adherence
- hydration targets
- cardio execution
- training split consistency
- physique check-ins
- week-over-week comparison
- stage-readiness feedback

So I built an iOS-first React Native app around that workflow.

ShapeIQ combines daily protocol tracking, training execution, prep adherence history, physique check-ins, and Claude Vision analysis into one focused mobile experience.

Stack:
Expo · React Native · TypeScript · Zustand · Claude Vision

The most interesting part:
ShapeIQ uses AI vision to analyze physique check-ins against competitive bodybuilding criteria, turning photos into structured feedback around conditioning, symmetry, V-taper and stage readiness.

This project is personal, but also represents the kind of software I like building:
real workflow, real user, real constraints, AI where it actually adds value.

ShapeIQ — Sua prep. Seu shape. Com IA.
```

---

## 8. Hashtags

```
#ShapeIQ #reactnative #expo #typescript #bodybuilding #bodybuildingprep #mobiledev #aiengineering #devbr #gymcode #treinoecode #buildinpublic #fullstackdeveloper
```

---

## 9. Versão curta — 20 segundos

| Tempo | Overlay | VO (opcional) |
|-------|---------|---------------|
| 0–2s | Apps fitness não entendem prep. | — |
| 2–5s | Dieta. Cardio. Treino. Físico. | Eu precisava trackar prep do jeito certo. |
| 5–8s | Então construí o ShapeIQ. | Então construí o ShapeIQ. |
| 8–11s | Today Briefing | Próxima ação do dia. |
| 11–14s | Training Session | Treino guiado. |
| 14–17s | Physique Intelligence | IA analisando meu físico. |
| 17–20s | ShapeIQ / Sua prep. Seu shape. Com IA. | — |

Composição: `videos/shapeiq-launch-short/index.html`

---

## 10. Sugestão de música / estilo sonoro

**Vibe:** dark, energético, cinemático — gym + code. Nada startup feliz.

| Referência | Por quê |
|------------|---------|
| Trap/cinematic hybrid (808 + strings) | Intensidade prep |
| Dark techno / industrial leve | Ritmo de cortes rápidos |
| Hans Zimmer–lite pulses | Premium, sério |

**Especificações:**
- BPM: 120–140 (cortes a cada 2–4 beats)
- Sem vocal sample motivacional
- Drop suave em 0:09 (virada) e 0:35 (IA)
- Sidechain leve no VO

**Fontes (royalty-free):**
- Epidemic Sound: search "dark cinematic trap", "aggressive tech"
- Artlist: "workout dark", "code hacker"
- Uppbeat: "intense minimal"

**HeyGen catalog:** `npx hyperframes` + `/media-use` para resolver BGM.

---

## Editing notes

1. Primeiros 2s = hook visual forte (nunca logo, nunca stack)
2. App só depois do conflito (≥ 0:13)
3. Stack técnica só após valor do produto (≥ 0:44)
4. Cortes rápidos gym ↔ app ↔ código
5. Uma ideia por tela — sem tutorial
6. Dados demo realistas — zero empty state
7. Nunca mostrar API keys, e-mails, tokens

---

## HyperFrames workflow

```powershell
# Preview / edit
cd videos/shapeiq-launch
npm run dev

# Quality check
npm run check

# Render 60s
npx hyperframes render --quality high --output renders/shapeiq-launch-60s.mp4

# Render 20s
cd ../shapeiq-launch-short
npx hyperframes render --quality high --output renders/shapeiq-launch-20s.mp4
```

**Próximo passo de produção:** gravar A-roll + screen recordings, substituir backgrounds mock nos frames correspondentes, gerar VO com `npx hyperframes tts --language pt-BR`, mixar BGM no render final ou pós (Da Capo / Premiere / CapCut).
