import { treinos } from '@/data/treinos'
import type { GymSession } from '@/stores/slices/gymLogSlice'
import { buildExerciseSetLogs } from '@/utils/trainingPerformanceUtils'
import {
  getTodayTrainingBriefing,
  getTodayTrainingExecutionStatus,
  isTodayTrainingComplete,
  needsTodayTrainingAction,
  formatTodayTrainingEvidence,
} from '@/utils/todayTrainingUtils'

const treinoA = treinos[0]

function makePartialSession(completedSetIds: string[]): GymSession {
  const logs = treinoA.exercicios.slice(0, 2).map((exercicio) => {
    const sets = buildExerciseSetLogs(exercicio).map((set) => ({
      ...set,
      loadKg: completedSetIds.includes(set.id) ? 80 : null,
      repsCompleted: completedSetIds.includes(set.id) ? 8 : null,
      isCompleted: completedSetIds.includes(set.id),
      completedAt: completedSetIds.includes(set.id)
        ? '2026-06-27T10:00:00.000Z'
        : null,
    }))

    return {
      exercicioId: exercicio.id,
      nome: exercicio.nome,
      plannedSets: sets.length,
      sets,
    }
  })

  return {
    id: 'session-today',
    treinoId: treinoA.id,
    treinoNome: 'Treino A — Peito',
    date: '2026-06-27',
    startedAt: '2026-06-27T09:00:00.000Z',
    completedAt: null,
    logs,
  }
}

function makeFullSession(): GymSession {
  const allSetIds = treinoA.exercicios.flatMap((ex) =>
    buildExerciseSetLogs(ex).map((set) => set.id),
  )
  const logs = treinoA.exercicios.map((exercicio) => {
    const sets = buildExerciseSetLogs(exercicio).map((set) => ({
      ...set,
      loadKg: 80,
      repsCompleted: 8,
      isCompleted: true,
      completedAt: '2026-06-27T10:00:00.000Z',
    }))

    return {
      exercicioId: exercicio.id,
      nome: exercicio.nome,
      plannedSets: sets.length,
      sets,
    }
  })

  return {
    id: 'session-full',
    treinoId: treinoA.id,
    treinoNome: 'Treino A — Peito',
    date: '2026-06-27',
    startedAt: '2026-06-27T09:00:00.000Z',
    completedAt: null,
    logs,
  }
}

describe('getTodayTrainingBriefing — pending', () => {
  it('retorna pending quando há treino do dia mas não há sessão', () => {
    const briefing = getTodayTrainingBriefing({
      isTrainingDay: true,
      diaOffManual: false,
      treino: treinoA,
      session: undefined,
    })

    expect(briefing.status).toBe('pending')
    expect(briefing.title).toBe('Treino pendente')
    expect(briefing.nextActionLabel).toBe('Iniciar treino')
    expect(briefing.completedSets).toBe(0)
    expect(briefing.workoutLabel).toContain('Treino A')
  })
})

describe('getTodayTrainingBriefing — in-progress', () => {
  it('retorna in-progress com completedSets, totalSets e volume quando há sessão parcial', () => {
    const session = makePartialSession(['a1-set-1', 'a1-set-2'])
    const briefing = getTodayTrainingBriefing({
      isTrainingDay: true,
      diaOffManual: false,
      treino: treinoA,
      session,
    })

    expect(briefing.status).toBe('in-progress')
    expect(briefing.title).toBe('Treino em andamento')
    expect(briefing.completedSets).toBe(2)
    expect(briefing.totalSets).toBeGreaterThan(2)
    expect(briefing.volumeKg).toBe(1280)
    expect(briefing.nextActionLabel).toBe('Continuar treino')
  })
})

describe('getTodayTrainingBriefing — complete', () => {
  it('retorna complete quando todos os sets estão completos', () => {
    const session = makeFullSession()
    const briefing = getTodayTrainingBriefing({
      isTrainingDay: true,
      diaOffManual: false,
      treino: treinoA,
      session,
    })

    expect(briefing.status).toBe('complete')
    expect(briefing.title).toBe('Treino completo')
    expect(briefing.completedSets).toBe(briefing.totalSets)
    expect(briefing.nextActionLabel).toBe('Revisar treino')
    expect(briefing.subtitle).toContain('volume')
  })
})

describe('getTodayTrainingBriefing — current set', () => {
  it('retorna currentExerciseName e currentSetLabel para próxima ação', () => {
    const session = makePartialSession(['a1-set-1'])
    const briefing = getTodayTrainingBriefing({
      isTrainingDay: true,
      diaOffManual: false,
      treino: treinoA,
      session,
    })

    expect(briefing.currentExerciseName).toContain('Supino inclinado')
    expect(briefing.currentSetLabel).toBe(
      'Supino inclinado máquina/hammer · Set 2',
    )
  })
})

describe('getTodayTrainingBriefing — no-training', () => {
  it('retorna no-training em dia de descanso', () => {
    const briefing = getTodayTrainingBriefing({
      isTrainingDay: false,
      diaOffManual: false,
      treino: null,
      session: undefined,
    })

    expect(getTodayTrainingExecutionStatus({
      isTrainingDay: false,
      diaOffManual: false,
      treino: null,
      session: undefined,
    })).toBe('no-training')
    expect(briefing.title).toBe('Dia de Recuperação')
    expect(briefing.nextActionLabel).toBeNull()
  })

  it('retorna no-training em dia off manual', () => {
    const briefing = getTodayTrainingBriefing({
      isTrainingDay: true,
      diaOffManual: true,
      treino: treinoA,
      session: undefined,
    })

    expect(briefing.status).toBe('no-training')
    expect(briefing.title).toBe('Dia Off')
  })
})

describe('getTodayTrainingBriefing — incomplete / leak', () => {
  it('retorna incomplete quando sessão foi fechada sem completar todos os sets', () => {
    const session = {
      ...makePartialSession(['a1-set-1', 'a1-set-2']),
      completedAt: '2026-06-27T12:00:00.000Z',
    }

    const briefing = getTodayTrainingBriefing({
      isTrainingDay: true,
      diaOffManual: false,
      treino: treinoA,
      session,
    })

    expect(briefing.status).toBe('incomplete')
    expect(briefing.isLeak).toBe(true)
    expect(briefing.title).toBe('Vazamento no treino')
    expect(briefing.nextActionLabel).toBe('Continuar treino')
  })
})

describe('helpers', () => {
  it('isTodayTrainingComplete e needsTodayTrainingAction', () => {
    const pending = getTodayTrainingBriefing({
      isTrainingDay: true,
      diaOffManual: false,
      treino: treinoA,
      session: undefined,
    })
    const complete = getTodayTrainingBriefing({
      isTrainingDay: true,
      diaOffManual: false,
      treino: treinoA,
      session: makeFullSession(),
    })

    expect(isTodayTrainingComplete(pending)).toBe(false)
    expect(needsTodayTrainingAction(pending)).toBe(true)
    expect(isTodayTrainingComplete(complete)).toBe(true)
    expect(needsTodayTrainingAction(complete)).toBe(false)
  })

  it('formatTodayTrainingEvidence formata sets e volume', () => {
    const briefing = getTodayTrainingBriefing({
      isTrainingDay: true,
      diaOffManual: false,
      treino: treinoA,
      session: makePartialSession(['a1-set-1']),
    })

    expect(formatTodayTrainingEvidence(briefing)).toContain('sets')
    expect(formatTodayTrainingEvidence(briefing)).toContain('volume')
  })
})
