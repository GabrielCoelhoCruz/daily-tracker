import { treinos } from '@/data/treinos'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import type { Exercicio } from '@/data/treinos'
import {
  formatTrainingSetSummary,
  getCurrentTrainingExercise,
  getPreviousLoadForExercise,
  getSuggestedLoad,
  getTrainingProgress,
  getTrainingSessionSummary,
  getUpcomingTrainingExercises,
} from '@/utils/trainingSessionUtils'

const treinoA = treinos[0]

function makeSession(logs: Partial<{ id: string; cargaKg?: number }>[]): GymSession {
  return {
    id: 'session-1',
    treinoId: treinoA.id,
    treinoNome: 'Treino A — Peito',
    date: '2026-06-27',
    logs: treinoA.exercicios.map((ex, index) => {
      const override = logs.find((l) => l.id === ex.id)
      return {
        exercicioId: ex.id,
        nome: ex.nome,
        series: 4,
        repeticoes: 0,
        ...(override?.cargaKg != null ? { cargaKg: override.cargaKg } : {}),
      }
    }),
  }
}

describe('getTrainingSessionSummary', () => {
  it('returns training summary for a valid training day', () => {
    const summary = getTrainingSessionSummary({
      selectedDay: 1,
      todayDay: 1,
      diaOffManual: false,
      treino: treinoA,
    })

    expect(summary.mode).toBe('training')
    expect(summary.title).toBe('Treino A')
    expect(summary.subtitle).toBe('Peito')
    expect(summary.exerciseCount).toBe(treinoA.exercicios.length)
    expect(summary.muscleGroup).toBe('Peito')
  })

  it('returns rest summary for a non-training day', () => {
    const summary = getTrainingSessionSummary({
      selectedDay: 0,
      todayDay: 1,
      diaOffManual: false,
      treino: null,
    })

    expect(summary.mode).toBe('rest')
    expect(summary.title).toBe('Recovery Day')
    expect(summary.subtitle).toBe('No workout scheduled')
    expect(summary.exerciseCount).toBe(0)
  })

  it('returns day-off summary when viewing today and diaOffManual is true', () => {
    const summary = getTrainingSessionSummary({
      selectedDay: 1,
      todayDay: 1,
      diaOffManual: true,
      treino: null,
    })

    expect(summary.mode).toBe('day-off')
    expect(summary.title).toBe('Day Off')
    expect(summary.subtitle).toBe('Workout paused for today')
    expect(summary.exerciseCount).toBe(0)
  })
})

describe('getTrainingProgress', () => {
  it('calculates completed exercises from logged gym session loads', () => {
    const session = makeSession([
      { id: 'a1', cargaKg: 80 },
      { id: 'a2', cargaKg: 70 },
    ])

    const progress = getTrainingProgress(treinoA.exercicios, session)

    expect(progress.completedExercises).toBe(2)
    expect(progress.totalExercises).toBe(7)
    expect(progress.percentage).toBe(29)
  })

  it('returns zero progress when no session exists', () => {
    const progress = getTrainingProgress(treinoA.exercicios, undefined)

    expect(progress.completedExercises).toBe(0)
    expect(progress.totalExercises).toBe(7)
    expect(progress.percentage).toBe(0)
  })

  it('returns full progress when all exercises have logged loads', () => {
    const session = makeSession(
      treinoA.exercicios.map((ex) => ({ id: ex.id, cargaKg: 60 })),
    )

    const progress = getTrainingProgress(treinoA.exercicios, session)

    expect(progress.completedExercises).toBe(7)
    expect(progress.totalExercises).toBe(7)
    expect(progress.percentage).toBe(100)
  })
})

describe('getCurrentTrainingExercise', () => {
  it('returns the first exercise when no logs exist', () => {
    const current = getCurrentTrainingExercise(treinoA.exercicios, undefined)

    expect(current.exerciseId).toBe('a1')
    expect(current.index).toBe(0)
    expect(current.totalExercises).toBe(7)
    expect(current.status).toBe('not-started')
    expect(current.setSummary).toBe('2 WS · 2 TS')
  })

  it('returns the first unlogged exercise when some loads are logged', () => {
    const session = makeSession([{ id: 'a1', cargaKg: 80 }])
    const current = getCurrentTrainingExercise(treinoA.exercicios, session)

    expect(current.exerciseId).toBe('a2')
    expect(current.index).toBe(1)
    expect(current.status).toBe('active')
  })

  it('returns the last exercise as complete when all exercises are logged', () => {
    const session = makeSession(
      treinoA.exercicios.map((ex) => ({ id: ex.id, cargaKg: 50 })),
    )
    const current = getCurrentTrainingExercise(treinoA.exercicios, session)

    expect(current.exerciseId).toBe('a7')
    expect(current.index).toBe(6)
    expect(current.status).toBe('complete')
  })
})

describe('formatTrainingSetSummary', () => {
  it('formats WS/TS series into a readable compact summary', () => {
    const exercicio = treinoA.exercicios[0]
    expect(formatTrainingSetSummary(exercicio)).toBe('2 WS · 2 TS')
  })

  it('formats BS with reps', () => {
    const exercicio = treinoA.exercicios[2]
    expect(formatTrainingSetSummary(exercicio)).toBe('2 WS · 1 TS · 1 BS x15')
  })

  it('formats CS cluster reps', () => {
    const exercicio = treinoA.exercicios[3]
    expect(formatTrainingSetSummary(exercicio)).toBe('2 WS · 1 TS · 1 CS 4+4+4')
  })
})

describe('getSuggestedLoad', () => {
  it('returns null when no previous load exists', () => {
    expect(getSuggestedLoad(null)).toBeNull()
    expect(getSuggestedLoad(undefined)).toBeNull()
  })

  it('suggests +2.5kg for loads >= 20kg', () => {
    expect(getSuggestedLoad(80)).toBe(82.5)
    expect(getSuggestedLoad(20)).toBe(22.5)
  })

  it('suggests +1kg for loads below 20kg', () => {
    expect(getSuggestedLoad(10)).toBe(11)
    expect(getSuggestedLoad(19)).toBe(20)
  })
})

describe('getPreviousLoadForExercise', () => {
  it('returns the most recent load from a prior session', () => {
    const sessions: GymSession[] = [
      {
        id: 'old',
        treinoId: treinoA.id,
        treinoNome: 'Treino A',
        date: '2026-06-20',
        logs: [
          {
            exercicioId: 'a1',
            nome: 'Supino',
            series: 4,
            repeticoes: 0,
            cargaKg: 75,
          },
        ],
      },
      {
        id: 'recent',
        treinoId: treinoA.id,
        treinoNome: 'Treino A',
        date: '2026-06-24',
        logs: [
          {
            exercicioId: 'a1',
            nome: 'Supino',
            series: 4,
            repeticoes: 0,
            cargaKg: 80,
          },
        ],
      },
    ]

    expect(getPreviousLoadForExercise('a1', '2026-06-27', sessions)).toBe(80)
  })

  it('ignores today session when finding previous load', () => {
    const sessions: GymSession[] = [
      makeSession([{ id: 'a1', cargaKg: 90 }]),
      {
        id: 'prior',
        treinoId: treinoA.id,
        treinoNome: 'Treino A',
        date: '2026-06-20',
        logs: [
          {
            exercicioId: 'a1',
            nome: 'Supino',
            series: 4,
            repeticoes: 0,
            cargaKg: 80,
          },
        ],
      },
    ]

    expect(getPreviousLoadForExercise('a1', '2026-06-27', sessions)).toBe(80)
  })

  it('returns null when no historical load exists', () => {
    expect(getPreviousLoadForExercise('a1', '2026-06-27', [])).toBeNull()
  })
})

describe('getUpcomingTrainingExercises', () => {
  it('returns the next exercises after the current index', () => {
    const upcoming = getUpcomingTrainingExercises(treinoA.exercicios, 0, 3)

    expect(upcoming).toHaveLength(3)
    expect(upcoming[0].nome).toBe(treinoA.exercicios[1].nome)
    expect(upcoming[1].nome).toBe(treinoA.exercicios[2].nome)
    expect(upcoming[2].nome).toBe(treinoA.exercicios[3].nome)
  })

  it('returns fewer items when near the end of the workout', () => {
    const upcoming = getUpcomingTrainingExercises(treinoA.exercicios, 5, 4)

    expect(upcoming).toHaveLength(1)
    expect(upcoming[0].id).toBe('a7')
  })

  it('returns empty when current exercise is the last one', () => {
    expect(getUpcomingTrainingExercises(treinoA.exercicios, 6, 4)).toEqual([])
  })
})
