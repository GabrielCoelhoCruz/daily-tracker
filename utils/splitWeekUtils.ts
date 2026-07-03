import type { Treino } from '@/data/treinos'
import { getActiveTreinos } from '@/stores/useProtocolStore'

export type WeekSlotKind = 'treino' | 'cardio' | 'rest'

export type WeekDaySlot =
  | { kind: 'treino'; treinoId: string }
  | { kind: 'cardio' }
  | { kind: 'rest' }

/** Calendar days Mon(1) … Sun(0). */
export type SplitWeekPlan = Record<number, WeekDaySlot>

export const WEEK_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

/** Mon–Fri splits A–E, Sat cardio, Sun rest. Fully editable by the user. */
export const DEFAULT_SPLIT_WEEK_PLAN: SplitWeekPlan = {
  0: { kind: 'rest' },
  1: { kind: 'treino', treinoId: 'treino-a' },
  2: { kind: 'treino', treinoId: 'treino-b' },
  3: { kind: 'treino', treinoId: 'treino-c' },
  4: { kind: 'treino', treinoId: 'treino-d' },
  5: { kind: 'treino', treinoId: 'treino-e' },
  6: { kind: 'cardio' },
}

function getTreinoById(treinoId: string): Treino | null {
  return getActiveTreinos().find((treino) => treino.id === treinoId) ?? null
}

export function normalizeSplitWeekPlan(
  plan: Partial<SplitWeekPlan> | undefined,
): SplitWeekPlan {
  const normalized = { ...DEFAULT_SPLIT_WEEK_PLAN }

  if (!plan) return normalized

  for (const day of WEEK_DAY_ORDER) {
    const slot = plan[day]
    if (slot && isValidWeekDaySlot(slot)) {
      normalized[day] = slot
    }
  }

  return normalized
}

function isValidWeekDaySlot(slot: WeekDaySlot): boolean {
  if (slot.kind === 'cardio' || slot.kind === 'rest') return true
  return getTreinoById(slot.treinoId) != null
}

export function getWeekDaySlot(
  dayOfWeek: number,
  plan: SplitWeekPlan,
): WeekDaySlot {
  return plan[dayOfWeek] ?? DEFAULT_SPLIT_WEEK_PLAN[dayOfWeek] ?? { kind: 'rest' }
}

export function getTreinoFromWeekPlan(
  dayOfWeek: number,
  plan: SplitWeekPlan,
): Treino | null {
  const slot = getWeekDaySlot(dayOfWeek, plan)
  if (slot.kind !== 'treino') return null
  return getTreinoById(slot.treinoId)
}

export function countWeekPlanTreinoDays(plan: SplitWeekPlan): number {
  return WEEK_DAY_ORDER.filter((day) => getWeekDaySlot(day, plan).kind === 'treino')
    .length
}

export function formatWeekDaySlot(slot: WeekDaySlot): string {
  if (slot.kind === 'cardio') return 'Cardio'
  if (slot.kind === 'rest') return 'Descanso'
  const treino = getTreinoById(slot.treinoId)
  if (!treino) return 'Treino'
  return `Treino ${treino.letra} · ${treino.grupoMuscular}`
}

export function formatWeekDaySlotShort(slot: WeekDaySlot): string {
  if (slot.kind === 'cardio') return 'Cardio'
  if (slot.kind === 'rest') return 'Descanso'
  const treino = getTreinoById(slot.treinoId)
  if (!treino) return '—'
  return `${treino.letra} · ${treino.grupoMuscular}`
}

export function getWeekDaySlotLetter(slot: WeekDaySlot): string {
  if (slot.kind === 'cardio') return '♥'
  if (slot.kind === 'rest') return '○'
  const treino = getTreinoById(slot.treinoId)
  return treino?.letra ?? '—'
}

export function setWeekDaySlotInPlan(
  plan: SplitWeekPlan,
  dayOfWeek: number,
  slot: WeekDaySlot,
): SplitWeekPlan {
  return {
    ...plan,
    [dayOfWeek]: slot,
  }
}

export function getInitialWorkoutDay(
  todayDay: number,
  plan: SplitWeekPlan,
): number {
  if (getWeekDaySlot(todayDay, plan).kind === 'treino') {
    return todayDay
  }

  const todayIndex = WEEK_DAY_ORDER.indexOf(
    todayDay as (typeof WEEK_DAY_ORDER)[number],
  )

  for (let offset = 1; offset <= WEEK_DAY_ORDER.length; offset += 1) {
    const day = WEEK_DAY_ORDER[(todayIndex + offset) % WEEK_DAY_ORDER.length]
    if (getWeekDaySlot(day, plan).kind === 'treino') {
      return day
    }
  }

  return todayDay
}

export const SPLIT_ASSIGNMENT_OPTIONS: WeekDaySlot[] = [
  ...getActiveTreinos().map((treino) => ({
    kind: 'treino' as const,
    treinoId: treino.id,
  })),
  { kind: 'cardio' },
  { kind: 'rest' },
]

export function getSplitAssignmentOptions(): WeekDaySlot[] {
  return [
    ...getActiveTreinos().map((treino) => ({
      kind: 'treino' as const,
      treinoId: treino.id,
    })),
    { kind: 'cardio' },
    { kind: 'rest' },
  ]
}

export function areWeekDaySlotsEqual(a: WeekDaySlot, b: WeekDaySlot): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'treino' && b.kind === 'treino') {
    return a.treinoId === b.treinoId
  }
  return true
}
