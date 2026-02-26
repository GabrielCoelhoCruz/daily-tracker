# PRD: UI/UX Overhaul — DailyTracker

## Introduction

Full visual and UX overhaul of the DailyTracker app. The app currently works well functionally (all 22 user stories complete) but the UI uses basic styling with inconsistent spacing, mixed icon libraries (Ionicons + FontAwesome), a custom JS tab bar with `expo-glass-effect`, and no layout animations. This PRD targets a polished, native-feeling dark-theme experience using NativeTabs, SF Symbols, better typography hierarchy, and smooth state transitions — all within Expo Go on SDK 54.

## Goals

- Switch tab bar to NativeTabs for system-native appearance (liquid glass on iOS 26, Material 3 on Android)
- Use SF Symbols (`sf` prop) for tab icons; standardize in-app icons on `MaterialCommunityIcons` (Expo Go compat)
- Improve visual hierarchy with consistent typography scale, spacing, and card design
- Add smooth layout transitions for state changes (expand/collapse, check/uncheck, modals)
- Improve touch targets, haptic feedback, and overall tactile feel
- Follow Apple HIG patterns: content-first, clean cards, proper safe areas
- Wrap root in ThemeProvider with DarkTheme to prevent header flicker with NativeTabs

## Dependency Graph

```
US-000 (preparation)
  └─► US-001 (NativeTabs + route restructure)
        ├─► US-002 (icons)
        ├─► US-003 (typography)
        ├─► US-004 (cards)
        ├─► US-005 (Hoje screen)
        ├─► US-006 (Treino screen)
        ├─► US-007 (Histórico screen)
        ├─► US-008 (Config screen)
        └─► US-009 (animations)
              └─► US-010 (cleanup) — depends on ALL above
```

US-002 through US-009 can be worked in parallel after US-001 is confirmed working.

## User Stories

### US-000: Verify SDK 54 NativeTabs compatibility
**Description:** As a developer, I want to verify NativeTabs works in Expo Go on SDK 54 before restructuring the entire app.

**Acceptance Criteria:**
- [ ] Create a minimal NativeTabs layout in a throwaway branch
- [ ] Confirm standalone imports work: `import { NativeTabs, Icon, Label, VectorIcon } from 'expo-router/unstable-native-tabs'`
- [ ] Confirm `Icon` with `sf` prop renders on iOS in Expo Go
- [ ] Confirm `VectorIcon` with `MaterialCommunityIcons` renders on Android in Expo Go
- [ ] Confirm `ThemeProvider` with `DarkTheme` prevents header flicker
- [ ] Confirm `ScrollView` as first child makes tab bar transparent on iOS 18
- [ ] Document any SDK 54-specific quirks found

### US-001: Migrate to NativeTabs
**Description:** As a user, I want a system-native tab bar so the app feels like a first-class iOS/Android citizen.

**Acceptance Criteria:**
- [ ] Replace custom `GlassTabBar` + JS `Tabs` with `NativeTabs` from `expo-router/unstable-native-tabs`
- [ ] SDK 54 syntax: use standalone `Icon`, `Label`, `VectorIcon` imports (not compound `NativeTabs.Trigger.X`)
- [ ] Tab icons use SF Symbols via `Icon` with `sf` prop for native feel:
  - Hoje: `<Icon sf={{ default: "checkmark.circle", selected: "checkmark.circle.fill" }} />`
  - Treino: `<Icon sf={{ default: "dumbbell", selected: "dumbbell.fill" }} />`
  - Histórico: `<Icon sf={{ default: "calendar", selected: "calendar" }} />`
- [ ] Android fallback: use `VectorIcon` with `MaterialCommunityIcons` since `md` prop is SDK 55+ only
  - Hoje: `check-circle-outline`, Treino: `dumbbell`, Histórico: `calendar-month`
  - Wrap in `Platform.select` or conditional rendering
- [ ] Set `tintColor="#f59e0b"` on NativeTabs
- [ ] Remove `expo-glass-effect` import from tab layout (NativeTabs handles glass natively on iOS 26)
- [ ] Wrap root layout (`app/_layout.tsx`) in `ThemeProvider` with `DarkTheme` from `@react-navigation/native`
- [ ] Each tab group gets its own `Stack` layout for native headers (NativeTabs don't render headers)
- [ ] Restructure routes into tab groups:
  - `app/(tabs)/_layout.tsx` — NativeTabs layout
  - `app/(tabs)/(hoje)/_layout.tsx` — Stack with `title: "Hoje"`, `headerLargeTitle: true`
  - `app/(tabs)/(hoje)/index.tsx` — main checklist screen
  - `app/(tabs)/(treino)/_layout.tsx` — Stack with `title: "Treino"`, `headerLargeTitle: true`
  - `app/(tabs)/(treino)/index.tsx` — workout screen
  - `app/(tabs)/(historico)/_layout.tsx` — Stack with `title: "Histórico"`, `headerLargeTitle: true`
  - `app/(tabs)/(historico)/index.tsx` — history screen
  - `app/(tabs)/(historico)/dia-detalhe.tsx` — day detail as route-based formSheet
- [ ] NativeTabs trigger `name` must match route group name exactly: `name="(hoje)"`, `name="(treino)"`, `name="(historico)"`
- [ ] Config screen presented as modal from root Stack (already done)
- [ ] Each screen has `ScrollView` as its first child (required for tab bar transparency on iOS 18)
- [ ] Tab bar works in Expo Go on iOS 18+ and Android
- [ ] Typecheck passes

### US-002: Standardize in-app icons to MaterialCommunityIcons
**Description:** As a user, I want consistent, meaningful icons throughout the app so the interface is easy to scan.

**Note:** Tab icons use SF Symbols (US-001). This story covers all other in-app icons where we use `MaterialCommunityIcons` for Expo Go compatibility.

**Acceptance Criteria:**
- [ ] Replace all `FontAwesome` and `Ionicons` imports with `MaterialCommunityIcons` from `@expo/vector-icons`
- [ ] Icon mapping (adjust as needed during implementation):
  - Checklist items: `checkbox-marked-circle-outline` / `checkbox-blank-circle-outline`
  - Water: `water` / `water-outline`
  - Tea: `tea` / `tea-outline`
  - Cardio: `run-fast`
  - Dumbbell/Treino: `dumbbell`
  - Food/Refeição: `food-apple`
  - Pills/Suplementos: `pill`
  - Calendar: `calendar-month`
  - Streak/Fire: `fire`
  - Settings/Config: `cog`
  - Moon/Dia Off: `moon-waning-crescent`
  - Tips/Dicas: `lightbulb-outline`
  - Expand/Collapse: `chevron-down` / `chevron-up`
  - Close: `close`
  - Add: `plus`
  - Remove: `minus-circle-outline`
  - Trophy: `trophy`
  - Alert: `alert-circle-outline`
  - Info: `information-outline`
- [ ] Icon size scale: 16px (inline), 20px (list items), 24px (cards/headers), 28px (empty states)
- [ ] Remove all `@expo/vector-icons/FontAwesome` and `@expo/vector-icons/Ionicons` imports
- [ ] Typecheck passes

### US-003: Implement typography scale
**Description:** As a user, I want clear visual hierarchy in text so I can scan information quickly.

**Acceptance Criteria:**
- [ ] Define typography scale as inline style objects in `constants/theme.ts` (not Tailwind utilities — avoids competing style systems):
  - `caption`: `{ fontSize: 11, color: theme.colors.text.secondary }` — timestamps, badges
  - `footnote`: `{ fontSize: 13, color: theme.colors.text.secondary }` — descriptions, sub-labels
  - `body`: `{ fontSize: 15, color: theme.colors.text.primary }` — main content text
  - `callout`: `{ fontSize: 16, fontWeight: '600', color: theme.colors.text.primary }` — card titles, section names
  - `headline`: `{ fontSize: 17, fontWeight: '700', color: theme.colors.text.primary }` — screen section headers
  - `title3`: `{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary }` — prominent stats/numbers
- [ ] Use `fontVariant: ['tabular-nums']` on all numeric displays (progress, counters, stats)
- [ ] Add `selectable` prop to Text elements showing data (stats, percentages, counts)
- [ ] Apply scale consistently via inline `style` prop (NativeWind `className` continues for layout)
- [ ] Typecheck passes

### US-004: Redesign Card component
**Description:** As a user, I want cards that feel tactile and polished with proper depth and spacing.

**Acceptance Criteria:**
- [ ] Update `Card` component with:
  - `borderRadius: 16` with `borderCurve: 'continuous'`
  - Subtle `boxShadow: '0 1px 3px rgba(0,0,0,0.3)'` (requires New Architecture — verify on RN 0.81.5)
  - If `boxShadow` doesn't work, fall back to `shadowColor/shadowOffset/shadowOpacity/shadowRadius` on iOS + `elevation` on Android
  - Remove hard border (use shadow for depth instead)
  - Consistent inner padding: 16px
  - Gap of 12px between cards
- [ ] Cards used for: PeriodoSection, HidratacaoCard, CardioCard, StatsCard, DicasSection
- [ ] Typecheck passes

### US-005: Redesign Hoje (main checklist) screen
**Description:** As a user, I want the daily checklist screen to feel organized and scannable.

**Acceptance Criteria:**
- [ ] Stack header configured in `app/(tabs)/(hoje)/_layout.tsx` with `title: "Hoje"`, `headerLargeTitle: true`
- [ ] Move date display to header subtitle or below-header area (not a custom text element)
- [ ] Settings button as `headerRight` in Stack.Screen options (inside the `(hoje)` Stack layout, not the tab layout)
- [ ] Dia Off toggle as a prominent card at the top (not inline with date)
- [ ] Progress bar redesign: thicker track (h-3), rounded, with percentage label right-aligned
- [ ] PeriodoSection: cleaner expand/collapse with chevron rotation
- [ ] CheckItem: larger touch target (min 44pt height), checkbox icon swap to MaterialCommunityIcons
- [ ] HidratacaoCard: stepper buttons with proper +/- icons, cleaner progress display
- [ ] CardioCard: cleaner input area with proper add button
- [ ] `ScrollView` as **first child** of route component with `contentInsetAdjustmentBehavior="automatic"`
- [ ] Content container uses padding via `contentContainerStyle` (not wrapper padding)
- [ ] Typecheck passes

### US-006: Redesign Treino (workout) screen
**Description:** As a user, I want the workout screen to clearly show my exercises with visual weight.

**Acceptance Criteria:**
- [ ] Stack header configured in `app/(tabs)/(treino)/_layout.tsx` with `title: "Treino"`, `headerLargeTitle: true`
- [ ] Workout day name + muscle group as subtitle/description below header
- [ ] ExercicioItem redesign: exercise number as accent-colored badge, clearer series display
- [ ] SerieBadge: consistent pill design, keep color coding (WS=amber, TS=red, BS=green, CS=warning)
- [ ] Dia Off empty state: centered, larger moon icon (48px), descriptive text
- [ ] DicasSection with SeriesLegend at top
- [ ] `ScrollView` as **first child** with `contentInsetAdjustmentBehavior="automatic"`
- [ ] Typecheck passes

### US-007: Redesign Histórico (history) screen
**Description:** As a user, I want the history screen to feel like a native calendar experience with clear stats.

**Acceptance Criteria:**
- [ ] Stack header configured in `app/(tabs)/(historico)/_layout.tsx` with `title: "Histórico"`, `headerLargeTitle: true`
- [ ] Calendario: slightly larger cells, bolder today indicator, smoother month transition
- [ ] Calendar cells: `borderCurve: 'continuous'` on rounded corners
- [ ] StatsCard: horizontal layout for key metrics (streak, weekly, monthly) with icon + number + label stacked
- [ ] DiaDetalhe as route-based formSheet:
  - Create `app/(tabs)/(historico)/dia-detalhe.tsx` route
  - Configure in `(historico)/_layout.tsx`: `presentation: "formSheet"`, `sheetGrabberVisible: true`, `sheetAllowedDetents: [0.5, 1.0]`
  - Navigate via `router.push('/(historico)/dia-detalhe?date=YYYY-MM-DD')` from calendar cell tap
  - Remove old `<Modal>` component from `DiaDetalhe.tsx`
- [ ] Empty state with calendar-outline icon + descriptive text
- [ ] `ScrollView` as **first child** with `contentInsetAdjustmentBehavior="automatic"`
- [ ] Typecheck passes

### US-008: Redesign Config (settings) screen
**Description:** As a user, I want the settings screen to feel like a native iOS settings page.

**Acceptance Criteria:**
- [ ] Present as modal with native header (`presentation: "modal"` already set)
- [ ] Group related settings into sections with section headers (footnote style, uppercase, secondary color)
- [ ] Each setting row: consistent height (min 44pt), label left, control right
- [ ] Time inputs: use cleaner inline style, consider a custom time display that looks like iOS
- [ ] Hydration interval selector: segmented-control style (3 options in a row)
- [ ] Switch components: consistent track colors (accent when on, muted when off)
- [ ] Proper dividers between rows (hairline, inset from left)
- [ ] `ScrollView` with `contentInsetAdjustmentBehavior="automatic"`
- [ ] Typecheck passes

### US-009: Add smooth layout transitions
**Description:** As a user, I want smooth visual feedback when UI state changes so the app feels responsive.

**Acceptance Criteria:**
- [ ] Enable LayoutAnimation on Android: `UIManager.setLayoutAnimationEnabledExperimental?.(true)` in root layout
- [ ] Use `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` for:
  - PeriodoSection expand/collapse
  - DicasSection expand/collapse
  - Check/uncheck items (opacity transition)
  - Adding/removing cardio sessions
  - Progress bar width changes
- [ ] Haptic feedback (`expo-haptics` Light impact) on:
  - Check/uncheck (already exists — verify consistent)
  - Stepper buttons (+/-) for water/tea
  - Dia Off toggle
  - Tab changes (if NativeTabs supports it, otherwise skip)
- [ ] Haptics only on iOS (`process.env.EXPO_OS === 'ios'`)
- [ ] No heavy animations (no Reanimated entering/exiting for now) — keep it lightweight
- [ ] Typecheck passes

### US-010: Clean up dependencies and code
**Description:** As a developer, I want to remove unused dependencies and dead code from the migration.

**Note:** Only execute after ALL other stories are confirmed working.

**Acceptance Criteria:**
- [ ] Remove `expo-glass-effect` from package.json
- [ ] Remove `expo-blur` from package.json (already unused)
- [ ] Remove any remaining FontAwesome/Ionicons imports
- [ ] Remove old `GlassTabBar` component and its styles
- [ ] Remove old `DiaDetalhe` modal component (replaced by route)
- [ ] Remove old flat route files (`app/(tabs)/index.tsx`, `treino.tsx`, `historico.tsx`)
- [ ] Ensure no unused components remain in `components/`
- [ ] Run `npx tsc --noEmit` — passes clean
- [ ] App runs correctly in Expo Go on both iOS and Android

## Functional Requirements

- FR-1: Tab bar must use `NativeTabs` with SF Symbols (`sf` prop) on iOS, `VectorIcon` + `MaterialCommunityIcons` fallback on Android
- FR-2: All in-app icons must come from `@expo/vector-icons/MaterialCommunityIcons`
- FR-3: Root layout must wrap content in `ThemeProvider` with `DarkTheme` from `@react-navigation/native`
- FR-4: Each tab must have its own `Stack` layout for native headers (NativeTabs don't render headers)
- FR-5: All `ScrollView`s must use `contentInsetAdjustmentBehavior="automatic"` and be the first child of the route component
- FR-6: Cards must use `borderCurve: 'continuous'` and `boxShadow` (no hard borders)
- FR-7: All numeric displays must use `fontVariant: ['tabular-nums']`
- FR-8: Layout changes (expand/collapse, add/remove) must use `LayoutAnimation`
- FR-9: Touch targets must be minimum 44pt
- FR-10: DiaDetalhe must be a route-based formSheet at `app/(tabs)/(historico)/dia-detalhe.tsx`

## Non-Goals

- No new features or functionality changes
- No data model/store changes
- No Reanimated or complex gesture-based animations
- No light theme support (dark only)
- No web support considerations
- No changes to notification logic
- No SDK upgrade (staying on SDK 54)

## Design Considerations

- **Color palette stays the same**: bg `#0c0a09`, card `#1c1917`, accent `#f59e0b`, success `#22c55e`
- **Styling approach**: NativeWind `className` for layout/spacing, inline `style` for typography scale and dynamic colors — this is the existing pattern, extended consistently
- **Apple HIG alignment**: Stack headers for titles, system controls, proper safe areas
- **Icon strategy**: SF Symbols for tab bar (native feel), MaterialCommunityIcons for in-app icons (Expo Go compat)
- **Icon weight**: Use outline variants for inactive/secondary, filled for active/primary states

## Technical Considerations

- **SDK 54**: NativeTabs uses standalone `Icon`, `Label`, `Badge`, `VectorIcon` imports (not compound syntax)
- **SDK 54**: `md` prop on Icon is NOT available — use `VectorIcon` for Android tab icons
- **Route restructure**: Moving from flat `(tabs)/index.tsx` to `(tabs)/(hoje)/index.tsx` requires:
  - NativeTabs trigger `name` must match group name exactly including parens
  - All `router.push`/`router.replace` calls must use new paths
  - Old flat route files must be removed (US-010)
- **ThemeProvider**: `import { ThemeProvider, DarkTheme } from '@react-navigation/native'` — wrap root Stack in `app/_layout.tsx`
- **NativeTabs limitations**: Max 5 tabs (we have 3), tabs must be static, no programmatic tab bar height measurement
- **ScrollView first child**: For NativeTabs tab bar transparency on iOS 18 and earlier, `ScrollView` must be the first opaque child of each screen. If wrapped in a `View`, set `collapsable={false}` on the wrapper
- **LayoutAnimation on Android**: Requires `UIManager.setLayoutAnimationEnabledExperimental?.(true)` — add to root layout
- **boxShadow**: CSS `boxShadow` syntax requires New Architecture (RN 0.81.5 should support it). Test early; fall back to legacy shadow props if needed
- **formSheet**: `presentation: "formSheet"` with `sheetAllowedDetents` requires the screen to be a route in a Stack — cannot be used with in-screen `<Modal>`

## Success Metrics

- App feels native — tab bar, headers, and sheets match system appearance
- Visual consistency — same icon family, typography scale, and card style everywhere
- Smooth — no jank on expand/collapse, no flash on tab switch
- Zero regressions — all 22 existing user stories still work
- Clean build — `npx tsc --noEmit` passes, no unused imports/dependencies

## Resolved Decisions

- **DiaDetalhe**: Route-based formSheet (not in-screen modal) — cleaner UX, follows Expo Router patterns
- **Tab icons**: SF Symbols on iOS, VectorIcon on Android — native feel while maintaining Expo Go compat
- **Typography**: Inline style objects in `constants/theme.ts` — avoids conflict with NativeWind
- **SDK**: Staying on 54 — no upgrade needed for this overhaul

## Open Questions

- Should we add a `headerSearchBarOptions` to the Histórico screen for filtering history by date?
- Do we want badge indicators on tabs (e.g., incomplete count on Hoje tab)?
