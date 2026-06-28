import {
  DEFAULT_SPLIT_WEEK_PLAN,
  countWeekPlanTreinoDays,
  formatWeekDaySlot,
  getInitialWorkoutDay,
  getTreinoFromWeekPlan,
  getWeekDaySlot,
  normalizeSplitWeekPlan,
  setWeekDaySlotInPlan,
  WEEK_DAY_ORDER,
} from '@/utils/splitWeekUtils'

describe('splitWeekUtils', () => {
  it('default plan has 5 treinos, 1 cardio, 1 rest', () => {
    expect(countWeekPlanTreinoDays(DEFAULT_SPLIT_WEEK_PLAN)).toBe(5)
    expect(getWeekDaySlot(6, DEFAULT_SPLIT_WEEK_PLAN).kind).toBe('cardio')
    expect(getWeekDaySlot(0, DEFAULT_SPLIT_WEEK_PLAN).kind).toBe('rest')
  })

  it('allows assigning any treino to any weekday', () => {
    const plan = setWeekDaySlotInPlan(DEFAULT_SPLIT_WEEK_PLAN, 5, {
      kind: 'treino',
      treinoId: 'treino-c',
    })
    expect(getTreinoFromWeekPlan(5, plan)?.grupoMuscular).toBe('Pernas')
  })

  it('formats treino, cardio and rest labels', () => {
    expect(formatWeekDaySlot({ kind: 'cardio' })).toBe('Cardio')
    expect(formatWeekDaySlot({ kind: 'rest' })).toBe('Descanso')
    expect(formatWeekDaySlot({ kind: 'treino', treinoId: 'treino-a' })).toContain(
      'Peito',
    )
  })

  it('normalizes partial persisted plans', () => {
    const plan = normalizeSplitWeekPlan({
      5: { kind: 'treino', treinoId: 'treino-c' },
    })
    expect(getTreinoFromWeekPlan(5, plan)?.id).toBe('treino-c')
    const slot = getWeekDaySlot(1, plan)
    expect(slot.kind).toBe('treino')
    if (slot.kind === 'treino') {
      expect(slot.treinoId).toBe('treino-a')
    }
  })

  it('picks today when today is a treino day', () => {
    expect(getInitialWorkoutDay(5, DEFAULT_SPLIT_WEEK_PLAN)).toBe(5)
  })

  it('picks next treino day when today is rest', () => {
    expect(getInitialWorkoutDay(0, DEFAULT_SPLIT_WEEK_PLAN)).toBe(1)
    expect(getInitialWorkoutDay(6, DEFAULT_SPLIT_WEEK_PLAN)).toBe(1)
  })

  it('covers all seven calendar days', () => {
    expect(WEEK_DAY_ORDER).toHaveLength(7)
  })
})
