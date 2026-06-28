import { treinos } from '@/data/treinos'
import { DEFAULT_SPLIT_WEEK_PLAN } from '@/utils/splitWeekUtils'
import {
  getTreinoById,
  getTreinoDoDia,
  isTreinoSwappedToday,
  resolveTreinoForDay,
} from '@/utils/diaUtils'

describe('resolveTreinoForDay', () => {
  it('returns scheduled treino from week plan when no override is set', () => {
    const treino = resolveTreinoForDay(5, {
      todayDay: 5,
      treinoHojeId: null,
      splitWeekPlan: DEFAULT_SPLIT_WEEK_PLAN,
    })
    expect(treino?.id).toBe('treino-e')
    expect(treino?.grupoMuscular).toBe('Braços')
  })

  it('returns swapped treino when viewing today with override', () => {
    const treino = resolveTreinoForDay(5, {
      todayDay: 5,
      treinoHojeId: 'treino-c',
      splitWeekPlan: DEFAULT_SPLIT_WEEK_PLAN,
    })
    expect(treino?.id).toBe('treino-c')
    expect(treino?.grupoMuscular).toBe('Pernas')
  })

  it('uses week plan assignment instead of legacy weekday mapping', () => {
    const customPlan = {
      ...DEFAULT_SPLIT_WEEK_PLAN,
      5: { kind: 'treino' as const, treinoId: 'treino-c' },
    }
    const treino = resolveTreinoForDay(5, { splitWeekPlan: customPlan })
    expect(treino?.grupoMuscular).toBe('Pernas')
  })

  it('returns null for cardio and rest days', () => {
    expect(
      resolveTreinoForDay(6, { splitWeekPlan: DEFAULT_SPLIT_WEEK_PLAN }),
    ).toBeNull()
    expect(
      resolveTreinoForDay(0, { splitWeekPlan: DEFAULT_SPLIT_WEEK_PLAN }),
    ).toBeNull()
  })

  it('falls back to scheduled treino when override id is invalid', () => {
    const treino = resolveTreinoForDay(5, {
      todayDay: 5,
      treinoHojeId: 'invalid-id',
      splitWeekPlan: DEFAULT_SPLIT_WEEK_PLAN,
    })
    expect(treino?.id).toBe('treino-e')
  })
})

describe('isTreinoSwappedToday', () => {
  it('returns true when today override differs from week plan', () => {
    expect(
      isTreinoSwappedToday(5, 'treino-c', DEFAULT_SPLIT_WEEK_PLAN),
    ).toBe(true)
  })

  it('returns false when override matches week plan', () => {
    expect(
      isTreinoSwappedToday(5, 'treino-e', DEFAULT_SPLIT_WEEK_PLAN),
    ).toBe(false)
  })

  it('returns false when no override is set', () => {
    expect(isTreinoSwappedToday(5, null, DEFAULT_SPLIT_WEEK_PLAN)).toBe(false)
  })
})

describe('getTreinoById', () => {
  it('finds treino by id', () => {
    expect(getTreinoById('treino-a')?.letra).toBe('A')
  })

  it('returns null for unknown id', () => {
    expect(getTreinoById('missing')).toBeNull()
  })
})

describe('getTreinoDoDia', () => {
  it('maps weekdays to split letters (legacy)', () => {
    expect(getTreinoDoDia(1)?.letra).toBe('A')
    expect(getTreinoDoDia(3)?.grupoMuscular).toBe('Pernas')
    expect(getTreinoDoDia(5)?.grupoMuscular).toBe('Braços')
  })
})
