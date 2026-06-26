<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--                         DAILYTRACKER                              -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

<div align="center">

<br/>

<img src="https://img.shields.io/badge/%E2%9A%A1-DAILY-0f0e0d?style=for-the-badge&labelColor=0f0e0d" height="40"/><!--
--><img src="https://img.shields.io/badge/TRACKER-f59e0b?style=for-the-badge&labelColor=f59e0b&color=f59e0b" height="40"/>

<br/><br/>

<samp><strong>AI-POWERED PHYSIQUE COMPANION FOR COMPETITIVE ATHLETES</strong></samp>

<br/>

<sup>Track meals · hydration · training splits · and get Claude-powered physique analysis against IFBB/NPC standards</sup>

<br/><br/>

<img src="https://img.shields.io/badge/EXPO_SDK-55-4630EB?style=flat-square&logo=expo&logoColor=white&labelColor=151312" />
&nbsp;
<img src="https://img.shields.io/badge/REACT_NATIVE-0.81-61DAFB?style=flat-square&logo=react&logoColor=61DAFB&labelColor=151312" />
&nbsp;
<img src="https://img.shields.io/badge/TYPESCRIPT-5.8_STRICT-3178C6?style=flat-square&logo=typescript&logoColor=3178C6&labelColor=151312" />
&nbsp;
<img src="https://img.shields.io/badge/ZUSTAND-5.0-f59e0b?style=flat-square&labelColor=151312" />
&nbsp;
<img src="https://img.shields.io/badge/NATIVEWIND-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=06B6D4&labelColor=151312" />
&nbsp;
<img src="https://img.shields.io/badge/CLAUDE_API-VISION-f59e0b?style=flat-square&logo=anthropic&logoColor=white&labelColor=151312" />

<br/><br/>

<!-- ─── BOTTOM NAV REPLICA ─── -->

<table>
<tr>
<td align="center" width="160">
<br/>
<samp><strong>DASH</strong></samp><br/>
<sup>Daily checklist</sup><br/>
<sup>Hydration · Cardio</sup><br/>
<br/>
</td>
<td align="center" width="160">
<br/>
<samp><strong>TRAIN</strong></samp><br/>
<sup>5-day workout split</sup><br/>
<sup>A–E protocols</sup><br/>
<br/>
</td>
<td align="center" width="160">
<br/>
<samp><strong>LOGS</strong></samp><br/>
<sup>Calendar history</sup><br/>
<sup>Day detail · Stats</sup><br/>
<br/>
</td>
<td align="center" width="160">
<br/>
<samp><strong>STATS</strong></samp><br/>
<sup>AI physique analysis</sup><br/>
<sup>Categories · Compare</sup><br/>
<br/>
</td>
</tr>
</table>

</div>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>OVERVIEW</samp>

DailyTracker is an **offline-first** React Native app for competitive bodybuilding athletes. It covers the full daily protocol — meal timing, supplement tracking, hydration targets, cardio sessions — and goes further with **AI-powered physique analysis** that evaluates progress photos against IFBB/NPC competition standards.

<br/>

<table>
<tr>
<td width="50%" valign="top">

### <samp>KEY FEATURES</samp>

<br/>

&nbsp;&nbsp; **`01`** &ensp; Conditional daily checklist with progress tracking<br/>
&nbsp;&nbsp; **`02`** &ensp; Claude vision AI physique analysis with structured scoring<br/>
&nbsp;&nbsp; **`03`** &ensp; 13 IFBB/NPC category eligibility calculator<br/>
&nbsp;&nbsp; **`04`** &ensp; Week-over-week side-by-side photo comparison<br/>
&nbsp;&nbsp; **`05`** &ensp; Per-meal + hydration notification system<br/>
&nbsp;&nbsp; **`06`** &ensp; 100% offline — all state persisted to AsyncStorage

</td>
<td width="50%" valign="top">

### <samp>DESIGN PRINCIPLES</samp>

<br/>

&nbsp;&nbsp; **`→`** &ensp; End-to-end type safety (strict TypeScript)<br/>
&nbsp;&nbsp; **`→`** &ensp; Offline-first with Zustand + AsyncStorage<br/>
&nbsp;&nbsp; **`→`** &ensp; Server-side prompt construction (zero client leaks)<br/>
&nbsp;&nbsp; **`→`** &ensp; NativeWind for static styles, inline for dynamic<br/>
&nbsp;&nbsp; **`→`** &ensp; File-based routing with typed routes<br/>
&nbsp;&nbsp; **`→`** &ensp; Rate-limited API proxy with input validation

</td>
</tr>
</table>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>TECH STACK</samp>

<div align="center">
<br/>

| | Layer | Technology | Version |
|:---:|:---|:---|:---:|
| ⚡ | **Framework** | Expo + Expo Router | SDK 55 / v6 |
| 🔷 | **Language** | TypeScript (strict) | 5.8 |
| 📱 | **UI** | React Native + NativeWind | 0.81 / v4 |
| 🗃️ | **State** | Zustand + AsyncStorage | 5.0 |
| 🤖 | **AI** | Claude API (vision) | Sonnet 4 |
| 📊 | **Charts** | react-native-gifted-charts | 1.4 |
| 🎬 | **Animations** | react-native-reanimated | 4.1 |
| 🔔 | **Notifications** | expo-notifications | 0.32 |
| 🏗️ | **Build** | EAS Build | dev / preview / prod |

<br/>
</div>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>ARCHITECTURE</samp>

```
                          ┌─────────────────────────────────┐
                          │         EXPO ROUTER              │
                          │     (file-based navigation)      │
                          └───────────────┬─────────────────┘
                                          │
              ┌───────────┬───────────────┼───────────────┬───────────┐
              │           │               │               │           │
        ┌─────┴─────┐ ┌──┴──────┐ ┌──────┴──────┐ ┌─────┴────────┐  │
        │   DASH    │ │  TRAIN  │ │    LOGS     │ │    STATS     │  │
        │           │ │         │ │             │ │              │  │
        │ Checklist │ │ Workout │ │  Calendar   │ │ AI Analysis  │  │
        │ Hydration │ │  Split  │ │   Stats     │ │ Categories   │  │
        │  Cardio   │ │  A – E  │ │  Day View   │ │  Comparison  │  │
        └─────┬─────┘ └────┬────┘ └──────┬──────┘ └──────┬───────┘  │
              │            │             │               │           │
              └────────────┴─────────────┴───────────────┘           │
                                         │                           │
                     ┌───────────────────┴───────────────────┐       │
                     │      ZUSTAND STORES (persisted)       │       │
                     │                                       │       │
                     │  DayStore · AthleteStore · Physique   │       │
                     │  HistoryStore · ConfigStore           │       │
                     └───────────────────┬───────────────────┘       │
                                         │                           │
                     ┌───────────────────┴───────────────────┐       │
                     │          SERVICES LAYER               │       │
                     │                                       │       │
                     │  physiqueAnalysis · categoryFinder    │       │
                     └───────────────────┬───────────────────┘       │
                                         │                           │
                     ┌───────────────────┴───────────────────┐       │
                     │       /api/analyze (API ROUTE)        │───────┘
                     │                                       │
                     │  Server-side prompt + Claude proxy    │
                     └───────────────────────────────────────┘
```

<br/>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>FEATURES</samp>

<!-- ─── DAILY CHECKLIST ─── -->

<details>
<summary>&ensp;<img src="https://img.shields.io/badge/01-DAILY_PROTOCOL-f59e0b?style=flat-square&labelColor=151312" />&ensp;<code>app/(tabs)/(hoje)</code></summary>

<br/>

> Tracks the full daily routine with conditional logic per day-of-week and training status.

| Feature | Description |
|:---|:---|
| **Meal periods** | Per-item checkboxes, conditional on day-of-week / training day |
| **Hydration** | Water (4000ml) + tea (500ml) goals with add/remove buttons |
| **Cardio** | Session logging with minutes + timestamps |
| **Free meal** | One per week, scoped to a specific meal period |
| **Day off** | Manual toggle skips training-day items |
| **Progress** | Non-optional completion bar |

<br/>
</details>

<!-- ─── TRAINING SPLIT ─── -->

<details>
<summary>&ensp;<img src="https://img.shields.io/badge/02-TRAINING_SPLIT-f59e0b?style=flat-square&labelColor=151312" />&ensp;<code>app/(tabs)/(treino)</code></summary>

<br/>

> Displays the workout for the current day from a 5-day split.

| Day | Split | Focus |
|:---:|:---:|:---|
| **MON** | A | Chest / Triceps |
| **TUE** | B | Back / Biceps |
| **WED** | C | Legs |
| **THU** | D | Shoulders / Abs |
| **FRI** | E | Full Body / Specialty |
| **SAT–SUN** | — | Rest Day |

<br/>
</details>

<!-- ─── HISTORY ─── -->

<details>
<summary>&ensp;<img src="https://img.shields.io/badge/03-HISTORY_&_LOGS-f59e0b?style=flat-square&labelColor=151312" />&ensp;<code>app/(tabs)/(historico)</code></summary>

<br/>

> Calendar view with completion markers, day detail, and aggregate stats.

- **Calendar** — interactive with visual markers for tracked days
- **Day detail** — completion percentage + missed items list
- **Stats card** — aggregate completion trends across weeks

<br/>
</details>

<!-- ─── AI PHYSIQUE ANALYSIS ─── -->

<details open>
<summary>&ensp;<img src="https://img.shields.io/badge/04-AI_PHYSIQUE_ANALYSIS-f59e0b?style=flat-square&labelColor=151312" />&ensp;<code>app/(tabs)/(progresso)</code></summary>

<br/>

> The core feature. Claude vision evaluates progress photos against IFBB/NPC competition standards with structured scoring.

### <samp>ANALYSIS MODES</samp>

| Mode | Photos | Purpose |
|:---:|:---:|:---|
| **FULL** | 4 (front, side, back, extra) | Standard weekly check-in |
| **QUICK** | 1 | Fast single-photo assessment |
| **COMPARATIVE** | 4 + previous week | Week-over-week delta analysis |
| **POSING** | 4–8 (category-specific) | Pose-by-pose evaluation |

### <samp>STRUCTURED SCORES</samp>

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  overallConditioning    ████████░░  8/10                │
│  stageReadiness         SE APROXIMANDO                  │
│  vTaper                 ███████░░░  7/10                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### <samp>6-BLOCK ANALYSIS PROTOCOL</samp>

&nbsp;&nbsp; **`01`** &ensp; Summary — quick wins, concerns, focus areas<br/>
&nbsp;&nbsp; **`02`** &ensp; Per-muscle-group evaluation vs category standards<br/>
&nbsp;&nbsp; **`03`** &ensp; Comparative visual analysis (if previous photos)<br/>
&nbsp;&nbsp; **`04`** &ensp; Category recommendation based on current physique<br/>
&nbsp;&nbsp; **`05`** &ensp; Posing feedback + favorite classic pose suggestion<br/>
&nbsp;&nbsp; **`06`** &ensp; Weekly action items

<br/>
</details>

<!-- ─── CATEGORY FINDER ─── -->

<details>
<summary>&ensp;<img src="https://img.shields.io/badge/05-CATEGORY_FINDER-f59e0b?style=flat-square&labelColor=151312" />&ensp;<code>services/categoryFinder.ts</code></summary>

<br/>

> Evaluates eligibility across **13 competitive categories** based on gender, height, and weight.

<table>
<tr>
<td valign="top" width="50%">

#### <samp>MALE CATEGORIES</samp>

- Men's Physique (A–F height classes)
- Muscular Men's Physique (Open)
- Classic Physique (formula-based)
- Classic Bodybuilding (strict limits)
- Bodybuilding IFBB / NPC

</td>
<td valign="top" width="50%">

#### <samp>FEMALE CATEGORIES</samp>

- Bikini (A–H height classes)
- Wellness
- Figure
- Women's Physique
- Women's Bodybuilding
- Bodyfitness
- Fit Model

</td>
</tr>
</table>

Each category includes: weight class, eligibility status, delta to limit, attire, mandatory poses, judging criteria, musculature & conditioning levels.

<br/>
</details>

<!-- ─── COMPARISON ─── -->

<details>
<summary>&ensp;<img src="https://img.shields.io/badge/06-PHOTO_COMPARISON-f59e0b?style=flat-square&labelColor=151312" />&ensp;<code>app/(tabs)/(progresso)/compare.tsx</code></summary>

<br/>

> Select two weeks via dropdown and compare photos at matching angles (front, side, back). Visual week-over-week tracking with weight delta display.

<br/>
</details>

<!-- ─── NOTIFICATIONS ─── -->

<details>
<summary>&ensp;<img src="https://img.shields.io/badge/07-NOTIFICATIONS-f59e0b?style=flat-square&labelColor=151312" />&ensp;<code>utils/notificationUtils.ts</code></summary>

<br/>

> Daily repeating triggers via `expo-notifications` with selective cancellation by type.

- **Per-meal reminders** — configurable time per meal period
- **Hydration alerts** — interval-based (every N hours)
- **Type tagging** — `data.type: "periodo" | "hidratacao"` for selective cancellation
- **Route handling** — notification tap navigates to relevant tab

<br/>
</details>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>PROJECT STRUCTURE</samp>

```
planTracker/
│
├── app/                              # EXPO ROUTER (file-based)
│   ├── _layout.tsx                   # Root Stack + notification setup
│   ├── config.tsx                    # Settings modal
│   ├── api/
│   │   └── analyze+api.ts            # Claude API proxy (POST /api/analyze)
│   └── (tabs)/
│       ├── (hoje)/index.tsx          # Daily checklist
│       ├── (treino)/index.tsx        # Workout display
│       ├── (historico)/
│       │   ├── index.tsx             # Calendar + stats
│       │   └── dia-detalhe.tsx       # Day detail view
│       └── (progresso)/
│           ├── index.tsx             # Check-in list
│           ├── new-checkin.tsx       # Create check-in + AI trigger
│           ├── result.tsx            # View analysis + share
│           ├── compare.tsx           # Side-by-side comparison
│           ├── categories.tsx        # Category finder results
│           ├── photo-guide.tsx       # Posing guide
│           └── profile.tsx           # Athlete profile form
│
├── components/                       # REUSABLE UI
│   ├── ui/                           # Card, Badge
│   ├── checklist/                    # CheckItem, PeriodoSection, ProgressBar
│   ├── hidratacao/                   # HidratacaoCard
│   ├── cardio/                       # CardioCard
│   ├── physique/                     # PhotoSlots, WeightDelta, EvolutionChart
│   ├── historico/                    # Calendario, StatsCard
│   ├── dicas/                        # DicasSection (tips)
│   └── treino/                       # ExercicioItem
│
├── stores/                           # ZUSTAND (all persisted)
│   ├── useDayStore.ts                # Checks, hydration, cardio, free meal
│   ├── useAthleteStore.ts            # Profile (name, gender, height, weight)
│   ├── usePhysiqueStore.ts           # Check-ins + analysis + scores
│   ├── useHistoryStore.ts            # Daily completion records
│   └── useConfigStore.ts             # Notification preferences
│
├── services/                         # BUSINESS LOGIC
│   ├── physiqueAnalysis.ts           # AI analysis client (base64 + POST)
│   └── categoryFinder.ts             # 13-category eligibility engine
│
├── data/                             # STATIC DATA
│   ├── plano.ts                      # Training plan + meal periods
│   ├── treinos.ts                    # Workout split (A–E)
│   └── dicas.ts                      # Tips / advice
│
├── utils/                            # UTILITIES
│   ├── dateUtils.ts                  # Logical dates, ISO week IDs
│   ├── diaUtils.ts                   # Training day logic + filtering
│   ├── resetUtils.ts                 # Daily midnight reset
│   ├── notificationUtils.ts          # Schedule / cancel notifications
│   └── animationUtils.ts             # Haptic + layout animation
│
├── constants/
│   └── theme.ts                      # Design tokens (colors, type, radius)
│
└── docs/                             # IFBB rules PDF, product specs
```

<br/>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>DESIGN SYSTEM</samp>

<table>
<tr>
<td valign="top" width="55%">

### <samp>COLOR PALETTE</samp>

| | Token | Hex |
|:---:|:---|:---:|
| <img src="https://img.shields.io/badge/-%20-0c0a09?style=flat-square" /> | `background` | `#0c0a09` |
| <img src="https://img.shields.io/badge/-%20-151312?style=flat-square" /> | `surface` | `#151312` |
| <img src="https://img.shields.io/badge/-%20-1c1917?style=flat-square" /> | `surface-container` | `#1c1917` |
| <img src="https://img.shields.io/badge/-%20-292524?style=flat-square" /> | `surface-elevated` | `#292524` |
| <img src="https://img.shields.io/badge/-%20-f59e0b?style=flat-square" /> | `primary` | `#f59e0b` |
| <img src="https://img.shields.io/badge/-%20-ffb95f?style=flat-square" /> | `primary-light` | `#ffb95f` |
| <img src="https://img.shields.io/badge/-%20-92400e?style=flat-square" /> | `primary-dark` | `#92400e` |
| <img src="https://img.shields.io/badge/-%20-22c55e?style=flat-square" /> | `success` | `#22c55e` |
| <img src="https://img.shields.io/badge/-%20-ef4444?style=flat-square" /> | `error` | `#ef4444` |
| <img src="https://img.shields.io/badge/-%20-fafaf9?style=flat-square" /> | `on-surface` | `#fafaf9` |
| <img src="https://img.shields.io/badge/-%20-a8a29e?style=flat-square" /> | `on-surface-variant` | `#a8a29e` |
| <img src="https://img.shields.io/badge/-%20-78716c?style=flat-square" /> | `muted` | `#78716c` |

</td>
<td valign="top" width="45%">

### <samp>TYPOGRAPHY</samp>

| Style | Size | Weight |
|:---|:---:|:---:|
| `caption` | 11 | Regular |
| `footnote` | 13 | Regular |
| `body` | 15 | Regular |
| `callout` | 16 | **Semibold** |
| `headline` | 17 | **Bold** |
| `title3` | 20 | **Bold** |

<br/>

### <samp>BORDER RADIUS</samp>

| Token | Value |
|:---|:---:|
| `sm` | 6px |
| `md` | 8px |
| `lg` | 12px |
| `xl` | 16px |

</td>
</tr>
</table>

<br/>

> **Styling approach** — NativeWind `className` for static styles, inline `style` for dynamic values from theme tokens. Tailwind config mirrors `constants/theme.ts`.

<br/>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>STATE MANAGEMENT</samp>

All stores use **Zustand v5 + persist middleware** with AsyncStorage. Accessible inside React (hooks) and outside (`useStore.getState()`, `useStore.subscribe()`).

```
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│     DAY STORE     │   │   ATHLETE STORE   │   │  PHYSIQUE STORE   │
│                   │   │                   │   │                   │
│  checks{}         │   │  name             │   │  checkIns[]       │
│  aguaMl / chaMl   │   │  gender           │   │  lastCategory     │
│  sessoesCardio[]  │   │  heightCm         │   │                   │
│  refeicaoLivre    │   │  currentWeightKg  │   │  + addCheckIn()   │
│  diaOffManual     │   │  phase / coach    │   │  + updateAnalysis()│
│                   │   │                   │   │                   │
│  + toggleCheck()  │   │  + updateProfile()│   │  scores:          │
│  + addAgua()      │   │  + isComplete()   │   │    conditioning   │
│  + resetDay()     │   │                   │   │    stageReadiness │
│                   │   │                   │   │    vTaper          │
└───────────────────┘   └───────────────────┘   └───────────────────┘

┌───────────────────┐   ┌───────────────────┐
│  HISTORY STORE    │   │   CONFIG STORE    │
│                   │   │                   │
│  dias{}           │   │  notificacoes{}   │
│                   │   │  hidratacao{}     │
│  + salvarDia()    │   │                   │
│  + getDia()       │   │  + toggle()       │
│                   │   │  + setHorario()   │
└───────────────────┘   └───────────────────┘
```

<br/>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>API ROUTE</samp>

**`POST /api/analyze`** — Server-side proxy to Claude API. System prompt, category metadata, and analysis protocol are constructed server-side (**never exposed to client**).

```
CLIENT                           SERVER (/api/analyze)              CLAUDE API
  │                                  │                                  │
  │  POST { photos[], prompt,        │                                  │
  │         athleteProfile }         │                                  │
  │ ────────────────────────────────►│                                  │
  │                                  │                                  │
  │                                  │  ┌─ Build system prompt          │
  │                                  │  │  + 13 category reference      │
  │                                  │  │  + 6-block analysis protocol  │
  │                                  │  └─                              │
  │                                  │                                  │
  │                                  │  POST (vision + text)            │
  │                                  │ ────────────────────────────────►│
  │                                  │                                  │
  │                                  │◄────── analysis + inline JSON    │
  │                                  │                                  │
  │◄──── { analysis, scores }       │                                  │
```

<div align="center">
<br/>

<img src="https://img.shields.io/badge/RATE_LIMIT-10_req_/_60s-151312?style=flat-square&labelColor=ef4444" />
&ensp;
<img src="https://img.shields.io/badge/MODEL-claude--sonnet--4-151312?style=flat-square&labelColor=f59e0b" />
&ensp;
<img src="https://img.shields.io/badge/VALIDATION-INPUT_SANITIZED-151312?style=flat-square&labelColor=22c55e" />

<br/><br/>
</div>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>DATA FLOWS</samp>

<details>
<summary>&ensp;<img src="https://img.shields.io/badge/-DAILY_RESET_CYCLE-151312?style=flat-square&labelColor=f59e0b" /></summary>

<br/>

```
App Opens
   │
   └── checkAndReset()
          │
          ├── Same logical day?  ──►  No-op
          │
          └── New day?
                ├── Save yesterday ──► HistoryStore.salvarDia()
                ├── Reset DayStore (checks, hydration, cardio)
                └── Preserve weekly free meal state
```

<br/>
</details>

<details>
<summary>&ensp;<img src="https://img.shields.io/badge/-PHYSIQUE_CHECK--IN_FLOW-151312?style=flat-square&labelColor=f59e0b" /></summary>

<br/>

```
Profile complete?
   │
   ├── No  ──►  Navigate to profile.tsx
   │
   └── Yes
        │
        └── New Check-in
              │
              ├── Select mode (full / quick / comparative / posing)
              ├── Upload photos via ImagePicker
              ├── Enter weight + notes
              │
              └── Submit
                    │
                    ├── physiqueAnalysis.ts
                    │     ├── Read images → base64
                    │     └── POST /api/analyze
                    │
                    ├── Parse analysis + extract inline JSON scores
                    ├── Save to PhysiqueStore.addCheckIn()
                    │
                    └── Navigate → result.tsx
```

<br/>
</details>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>GETTING STARTED</samp>

### <samp>PREREQUISITES</samp>

<table>
<tr>
<td>&ensp; Node.js 18+ &ensp;</td>
<td>&ensp; Expo CLI (<code>npx expo</code>) &ensp;</td>
<td>&ensp; iOS Simulator / Android Emulator &ensp;</td>
<td>&ensp; Claude API Key &ensp;</td>
</tr>
</table>

### <samp>INSTALL</samp>

```bash
git clone https://github.com/GabrielCoelhoCruz/planTracker.git
cd planTracker
npm install
```

### <samp>ENVIRONMENT</samp>

| Variable | Required | Default |
|:---|:---:|:---|
| `ANTHROPIC_API_KEY` | **Yes** | — |
| `ANTHROPIC_MODEL` | No | `claude-sonnet-4-20250514` |

### <samp>RUN</samp>

```bash
npx expo start              # Dev server
npx expo run:ios            # iOS
npx expo run:android        # Android
npx tsc --noEmit            # Type check
npm test                    # Jest tests
```

### <samp>EAS BUILD</samp>

```bash
eas build --profile development --platform ios     # Dev build
eas build --profile preview --platform all         # Internal distribution
eas build --profile production --platform all      # Production
```

<br/>

<!-- ═══════════════════════════════════════════════════════════════════ -->

## <samp>SCRIPTS</samp>

| Command | Description |
|:---|:---|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Start web version |
| `npm test` | Run Jest in watch mode |
| `npm run lint` | Run Expo lint |

<br/>

<!-- ═══════════════════════════════════════════════════════════════════ -->

<div align="center">

<br/>

<img src="https://img.shields.io/badge/-%20-0c0a09?style=flat-square" height="12" />&ensp;<img src="https://img.shields.io/badge/-%20-1c1917?style=flat-square" height="12" />&ensp;<img src="https://img.shields.io/badge/-%20-292524?style=flat-square" height="12" />&ensp;<img src="https://img.shields.io/badge/-%20-f59e0b?style=flat-square" height="12" />&ensp;<img src="https://img.shields.io/badge/-%20-ffb95f?style=flat-square" height="12" />&ensp;<img src="https://img.shields.io/badge/-%20-22c55e?style=flat-square" height="12" />&ensp;<img src="https://img.shields.io/badge/-%20-ef4444?style=flat-square" height="12" />&ensp;<img src="https://img.shields.io/badge/-%20-fafaf9?style=flat-square" height="12" />

<br/><br/>

<samp><strong>BUILT WITH EXPO + CLAUDE API</strong></samp>

<sup>Private project — all rights reserved.</sup>

<br/><br/>

</div>
