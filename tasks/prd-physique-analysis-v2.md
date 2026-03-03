# PRD: AI Physique Analysis v2 Upgrade

## Introduction

Upgrade the existing AI Physique Analysis feature to match the v2 prompt specification. The current implementation uses a simplified system prompt with a 6-section protocol and basic form inputs. The v2 upgrade adds IFBB/NPC official rules, weight class limits, mandatory poses per category, a 7-section analysis protocol, structured score extraction, target category selection, competition timeline awareness, a dedicated posing evaluation mode, and a stage readiness evolution chart.

## Goals

- Replace the v1 system prompt with the v2 version containing official IFBB/NPC judging criteria and rules
- Allow users to select a target competition category per check-in (persisted as default)
- Capture competition timeline for stage readiness estimation
- Add a posing evaluation mode with category-specific labeled photo slots
- Extract structured scores (conditioning, stage readiness, v-taper) from analysis via JSON block
- Display stage readiness evolution over time with `react-native-gifted-charts`
- Update all user prompt templates to match the v2 spec format

## User Stories

### US-001: Upgrade system prompt to v2
**Description:** As a developer, I need to replace the current system prompt in `services/physiqueAnalysis.ts` with the full v2 prompt so that the AI analysis uses official IFBB/NPC rules, weight classes, mandatory poses, judging criteria, and the 7-section protocol.

**Acceptance Criteria:**
- [ ] `SYSTEM_PROMPT` in `services/physiqueAnalysis.ts` is replaced with the full v2 prompt from `ai-physique-analysis-prompt-v2.md` (the `## System Prompt` code block)
- [ ] Athlete context variables (`ATHLETE_NAME`, `ATHLETE_AGE`, `ATHLETE_HEIGHT`, `ATHLETE_PHASE`) are still interpolated dynamically
- [ ] The prompt includes: eligible categories with weight/height limits for 1.72m, mandatory poses per category, official judging criteria, common scoring errors, and all 7 analysis sections
- [ ] `max_tokens` increased from 4096 to 8192 to accommodate the longer v2 analysis output
- [ ] Typecheck passes (`npx tsc --noEmit`)

### US-002: Add target category to store and types
**Description:** As a developer, I need to extend the `PhysiqueCheckIn` type and store to include `targetCategory` and `weeksToCompetition` fields, and persist the last selected category as default.

**Acceptance Criteria:**
- [ ] `PhysiqueCheckIn` type gains `targetCategory: 'mens_physique' | 'classic_physique' | 'bodybuilding' | 'undecided'` (required)
- [ ] `PhysiqueCheckIn` type gains `weeksToCompetition?: number` (optional)
- [ ] `PhysiqueCheckIn` type gains `scores?: { overallConditioning?: number; stageReadiness?: number; vTaper?: number }` (optional)
- [ ] Store gains a `lastCategory` field (persisted) that defaults to `'undecided'` and is updated whenever a check-in is saved
- [ ] `MODE_LABELS` updated to include `posing: "Posing"` for the new mode
- [ ] `PhysiqueCheckIn.mode` union updated to include `'posing'`
- [ ] Typecheck passes

### US-003: Add category selector and competition timeline to check-in form
**Description:** As a user, I want to select my target competition category and optionally enter weeks to competition so the AI analysis is category-specific and estimates my stage readiness timeline.

**Acceptance Criteria:**
- [ ] Category picker appears below the mode selector with 4 options: "Men's Physique", "Classic Physique", "Bodybuilding", "A definir"
- [ ] Category picker defaults to `lastCategory` from the store (persisted across sessions)
- [ ] Optional "Semanas para competição" number input field appears below the category picker
- [ ] Both fields are passed to the `analyzePhysique` service and included in the user prompt
- [ ] Selected category is saved to `lastCategory` in the store on submit
- [ ] Styling matches existing form inputs (dark elevated background, amber accent for selected)
- [ ] Typecheck passes

### US-004: Add posing evaluation mode
**Description:** As a user, I want a dedicated "Avaliação de Posing" mode with category-specific labeled photo slots for each mandatory pose, so the AI evaluates my pose execution.

**Acceptance Criteria:**
- [ ] Mode selector shows 3 options: "Completa", "Quick", "Posing"
- [ ] When "Posing" is selected, the category picker is required (cannot be "A definir")
- [ ] Photo slots change based on selected category:
  - Men's Physique: 4 slots labeled "Front Pose", "Side Esquerdo", "Back Pose", "Side Direito"
  - Classic Physique: 5 slots labeled "Front Double Biceps", "Side Chest", "Back Double Biceps", "Abs & Thighs", "Favorite Classic"
  - Bodybuilding: 8 slots labeled after the 8 mandatory poses
- [ ] `PhotoSlots` component accepts a `labels` prop to override the default labels
- [ ] A posing-specific user prompt is built (`buildPosingPrompt`) that includes the category and lists the poses photographed
- [ ] Typecheck passes

### US-005: Update user prompt templates to v2 format
**Description:** As a developer, I need to update all user prompt builder functions to match the v2 template format, including delta calculation, category label, and competition timeline.

**Acceptance Criteria:**
- [ ] `buildFullPrompt` includes: weight, previous weight with delta, category label (translated), weeks to competition, and notes
- [ ] `buildComparativePrompt` includes all of the above plus "Analise o progresso seguindo o protocolo completo com ênfase no comparativo"
- [ ] `buildQuickPrompt` includes: weight, category, and "avaliação rápida" instruction
- [ ] New `buildPosingPrompt` includes: category, list of poses photographed, and "Avalie cada pose" instruction matching v2 spec
- [ ] `AnalysisContext` type updated with `targetCategory` and `weeksToCompetition` fields
- [ ] Category labels map: `{ mens_physique: "Men's Physique", classic_physique: "Classic Physique", bodybuilding: "Bodybuilding", undecided: "A definir (sugira)" }`
- [ ] Typecheck passes

### US-006: Extract structured scores from analysis
**Description:** As a developer, I need the system prompt to instruct the AI to append a JSON scores block, and parse it from the response to store alongside the analysis.

**Acceptance Criteria:**
- [ ] System prompt includes an instruction at the end: "Ao final da análise, inclua um bloco JSON com scores extraídos" with the format `{"overallConditioning": 1-10, "stageReadiness": 0-100, "vTaper": 1-10}`
- [ ] After receiving the API response, the service parses the JSON block (regex for ```json...```) and returns it separately
- [ ] `analyzePhysique` return type changes from `string` to `{ analysis: string; scores?: { overallConditioning?: number; stageReadiness?: number; vTaper?: number } }`
- [ ] The JSON block is stripped from the `analysis` markdown text before display
- [ ] Parsing failures are non-fatal — scores will be `undefined` if extraction fails
- [ ] Scores are saved to the `PhysiqueCheckIn.scores` field in the store
- [ ] `new-checkin.tsx` updated to handle the new return type
- [ ] Typecheck passes

### US-007: Display scores on result screen
**Description:** As a user, I want to see my structured scores (conditioning, stage readiness, v-taper) displayed visually on the analysis result screen.

**Acceptance Criteria:**
- [ ] If `checkIn.scores` exists, a scores section appears between the photo thumbnails and the analysis markdown
- [ ] Three score cards displayed in a horizontal row:
  - "Condicionamento" (1-10 scale, circular or badge)
  - "Stage Readiness" (0-100%, progress bar style)
  - "V-Taper" (1-10 scale, circular or badge)
- [ ] Scores use amber accent color, dark elevated background, consistent with app theme
- [ ] If scores are missing, the section is not rendered (no empty state)
- [ ] Typecheck passes

### US-008: Stage readiness evolution chart
**Description:** As a user, I want to see a line chart showing my stage readiness score progression across weeks so I can track my trajectory toward competition readiness.

**Acceptance Criteria:**
- [ ] Install `react-native-gifted-charts` as a dependency
- [ ] New `EvolutionChart` component in `components/physique/` renders a line chart
- [ ] Chart data sourced from all check-ins that have `scores.stageReadiness` defined, ordered by week
- [ ] X-axis: week numbers. Y-axis: 0-100% stage readiness
- [ ] Line color: amber accent. Background: dark theme. Grid lines: subtle muted color
- [ ] Chart appears on the progresso index screen above the check-in list, only when 2+ data points exist
- [ ] If fewer than 2 data points, chart is not rendered
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Replace `SYSTEM_PROMPT` with v2 prompt containing IFBB/NPC rules, weight classes, poses, judging criteria, and 7-section protocol
- FR-2: Add `targetCategory`, `weeksToCompetition`, and `scores` to `PhysiqueCheckIn` type
- FR-3: Persist `lastCategory` in the physique store as default for new check-ins
- FR-4: Category picker (4 options) on the check-in form, defaulting to last selected
- FR-5: Optional "weeks to competition" numeric input on the check-in form
- FR-6: Posing mode with category-specific labeled photo slots matching mandatory poses
- FR-7: All user prompt templates updated to include category, delta, and competition timeline
- FR-8: System prompt instructs AI to output a JSON scores block; service parses and strips it
- FR-9: `analyzePhysique` returns `{ analysis, scores }` instead of plain string
- FR-10: Score cards (conditioning, stage readiness, v-taper) on the result screen
- FR-11: Stage readiness evolution line chart on the progresso index screen using `react-native-gifted-charts`

## Non-Goals

- No user profile/settings screen (category is persisted via store, not a separate screen)
- No photo comparison slider or overlay view
- No sharing/export of evolution chart
- No historical re-analysis of old check-ins with the v2 prompt
- No migration of existing check-ins (they will lack `targetCategory` and `scores` — handle gracefully with optional types)

## Technical Considerations

- The v2 system prompt is ~4000 tokens. Combined with 4 base64 images, the request can be large. Monitor for API timeouts — the existing 60s timeout may need extending for posing mode with 5-8 photos
- `react-native-gifted-charts` needs to be added as a dependency. It supports dark themes natively
- The JSON scores extraction uses a regex pattern for fenced code blocks. The prompt must be very explicit about the format to ensure reliable parsing
- Existing check-ins without `targetCategory` or `scores` must not break the app — all new fields are optional in the type
- The `PhotoSlots` component needs a `labels` prop without breaking existing usage (default to current LABELS)
- Bodybuilding posing mode has 8 photo slots — the 2-column grid will have 4 rows, which may require scrolling

## Success Metrics

- All v2 analysis sections (7 total) appear in Claude's response including stage readiness score and category recommendation
- Structured scores successfully extracted from >90% of analyses
- Evolution chart renders correctly with 2+ data points
- No regressions in existing full/comparative/quick modes

## Open Questions

- Should the timeout be increased beyond 60s for posing mode with 8 photos? (Suggest 90s for posing mode)
- Should we show a "suggested category" badge on the result screen when the AI recommends a different category than selected?
