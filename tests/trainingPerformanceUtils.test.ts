import { treinos } from '@/data/treinos'
import type { ExerciseLog, GymSession } from '@/stores/slices/gymLogSlice'
import {
  buildExerciseSetLogs,
  getCompletedSetCount,
  getCurrentSet,
  getExerciseVolume,
  getNextIncompleteSet,
  getSessionVolume,
  getSetVolume,
  getTotalSetCount,
  migrateLegacyExerciseLog,
  serieTipoToTrainingSetType,
} from '@/utils/trainingPerformanceUtils'

const treinoA = treinos[0]

describe('buildExerciseSetLogs', () => {
  it('converte WS para working', () => {
    const exercicio = treinoA.exercicios[0]
    const sets = buildExerciseSetLogs(exercicio)
    expect(sets[0].plannedSetType).toBe('working')
    expect(sets[1].plannedSetType).toBe('working')
  })

  it('converte TS para top', () => {
    const exercicio = treinoA.exercicios[0]
    const sets = buildExerciseSetLogs(exercicio)
    expect(sets[2].plannedSetType).toBe('top')
    expect(sets[3].plannedSetType).toBe('top')
  })

  it('converte BS para backoff', () => {
    const exercicio = treinoA.exercicios[2]
    const sets = buildExerciseSetLogs(exercicio)
    const backoff = sets.find((set) => set.plannedSetType === 'backoff')
    expect(backoff).toBeDefined()
    expect(backoff?.plannedReps).toBe(15)
  })

  it('converte CS para cluster', () => {
    const exercicio = treinoA.exercicios[3]
    const sets = buildExerciseSetLogs(exercicio)
    const cluster = sets.find((set) => set.plannedSetType === 'cluster')
    expect(cluster).toBeDefined()
    expect(cluster?.plannedReps).toBe('4+4+4')
  })

  it('preserva reps planejadas', () => {
    const exercicio = treinoA.exercicios[2]
    const sets = buildExerciseSetLogs(exercicio)
    const backoff = sets.find((set) => set.plannedSetType === 'backoff')
    expect(backoff?.plannedReps).toBe(15)
    expect(backoff?.targetReps).toBe(15)
  })

  it('gera a quantidade correta de sets', () => {
    const exercicio = treinoA.exercicios[0]
    const sets = buildExerciseSetLogs(exercicio)
    expect(sets).toHaveLength(4)
    expect(sets.map((set) => set.setNumber)).toEqual([1, 2, 3, 4])
  })

  it('gera ids estáveis por exercício', () => {
    const exercicio = treinoA.exercicios[0]
    const sets = buildExerciseSetLogs(exercicio)
    expect(sets[0].id).toBe('a1-set-1')
    expect(sets[3].id).toBe('a1-set-4')
  })
})

describe('serieTipoToTrainingSetType', () => {
  it('mapeia tipos desconhecidos para working', () => {
    expect(serieTipoToTrainingSetType('WS')).toBe('working')
  })
})

describe('volume helpers', () => {
  it('getSetVolume calcula load x reps', () => {
    expect(getSetVolume(80, 10)).toBe(800)
    expect(getSetVolume(32.5, 8)).toBe(260)
  })

  it('getSetVolume ignora carga/reps null', () => {
    expect(getSetVolume(null, 10)).toBe(0)
    expect(getSetVolume(80, null)).toBe(0)
  })

  it('getExerciseVolume ignora set incompleto', () => {
    const log: ExerciseLog = {
      exercicioId: 'a1',
      nome: 'Supino',
      plannedSets: 2,
      sets: [
        {
          id: 'a1-set-1',
          setNumber: 1,
          plannedSetType: 'working',
          completedSetType: 'working',
          plannedReps: null,
          targetReps: null,
          loadKg: 80,
          repsCompleted: 10,
          rpe: null,
          rir: null,
          isFailure: false,
          isCompleted: true,
          completedAt: '2026-06-27T10:00:00.000Z',
        },
        {
          id: 'a1-set-2',
          setNumber: 2,
          plannedSetType: 'working',
          completedSetType: 'working',
          plannedReps: null,
          targetReps: null,
          loadKg: 80,
          repsCompleted: null,
          rpe: null,
          rir: null,
          isFailure: false,
          isCompleted: false,
          completedAt: null,
        },
      ],
    }

    expect(getExerciseVolume(log)).toBe(800)
  })

  it('getSessionVolume soma volume da sessão', () => {
    const session: GymSession = {
      id: 's1',
      treinoId: 'treino-a',
      treinoNome: 'Treino A',
      date: '2026-06-27',
      startedAt: '2026-06-27T09:00:00.000Z',
      completedAt: null,
      logs: [
        {
          exercicioId: 'a1',
          nome: 'Supino',
          plannedSets: 1,
          sets: [
            {
              id: 'a1-set-1',
              setNumber: 1,
              plannedSetType: 'working',
              completedSetType: 'working',
              plannedReps: null,
              targetReps: null,
              loadKg: 80,
              repsCompleted: 10,
              rpe: null,
              rir: null,
              isFailure: false,
              isCompleted: true,
              completedAt: '2026-06-27T10:00:00.000Z',
            },
          ],
        },
        {
          exercicioId: 'a2',
          nome: 'Crucifixo',
          plannedSets: 1,
          sets: [
            {
              id: 'a2-set-1',
              setNumber: 1,
              plannedSetType: 'working',
              completedSetType: 'working',
              plannedReps: null,
              targetReps: null,
              loadKg: 20,
              repsCompleted: 12,
              rpe: null,
              rir: null,
              isFailure: false,
              isCompleted: true,
              completedAt: '2026-06-27T10:05:00.000Z',
            },
          ],
        },
      ],
    }

    expect(getSessionVolume(session)).toBe(1040)
  })
})

describe('completion progress', () => {
  function makeSessionWithSets(
    completedSetIds: string[],
  ): GymSession {
    const exercicio = treinoA.exercicios[0]
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
      id: 's1',
      treinoId: 'treino-a',
      treinoNome: 'Treino A',
      date: '2026-06-27',
      startedAt: '2026-06-27T09:00:00.000Z',
      completedAt: null,
      logs: [
        {
          exercicioId: exercicio.id,
          nome: exercicio.nome,
          plannedSets: sets.length,
          sets,
        },
      ],
    }
  }

  it('getCompletedSetCount e getTotalSetCount', () => {
    const session = makeSessionWithSets(['a1-set-1', 'a1-set-2'])
    expect(getCompletedSetCount(session)).toBe(2)
    expect(getTotalSetCount(session)).toBe(4)
  })

  it('getNextIncompleteSet retorna primeiro set incompleto', () => {
    const session = makeSessionWithSets(['a1-set-1'])
    expect(getNextIncompleteSet(session)).toEqual({
      exercicioId: 'a1',
      setId: 'a1-set-2',
    })
  })

  it('getNextIncompleteSet retorna null quando todos completos', () => {
    const session = makeSessionWithSets([
      'a1-set-1',
      'a1-set-2',
      'a1-set-3',
      'a1-set-4',
    ])
    expect(getNextIncompleteSet(session)).toBeNull()
  })

  it('getCurrentSet retorna primeiro set incompleto', () => {
    const session = makeSessionWithSets([])
    const current = getCurrentSet(session, treinoA.exercicios)
    expect(current?.set.id).toBe('a1-set-1')
    expect(current?.status).toBe('active')
  })

  it('getCurrentSet avança após completar set', () => {
    const session = makeSessionWithSets(['a1-set-1'])
    const current = getCurrentSet(session, treinoA.exercicios)
    expect(current?.set.id).toBe('a1-set-2')
  })

  it('getCurrentSet retorna complete quando todos os sets acabam', () => {
    const session = makeSessionWithSets([
      'a1-set-1',
      'a1-set-2',
      'a1-set-3',
      'a1-set-4',
    ])
    const current = getCurrentSet(session, treinoA.exercicios)
    expect(current?.status).toBe('complete')
    expect(current?.set.id).toBe('a1-set-4')
  })
})

describe('migrateLegacyExerciseLog', () => {
  it('migra log legado com carga para sets', () => {
    const legacy: ExerciseLog = {
      exercicioId: 'a1',
      nome: 'Supino',
      series: 4,
      repeticoes: 10,
      cargaKg: 80,
    }

    const migrated = migrateLegacyExerciseLog(legacy, treinoA.exercicios[0])
    expect(migrated.sets).toHaveLength(4)
    expect(migrated.sets?.[0].loadKg).toBe(80)
    expect(migrated.sets?.[0].repsCompleted).toBe(10)
    expect(migrated.sets?.[0].isCompleted).toBe(true)
    expect(migrated.sets?.[1].isCompleted).toBe(false)
  })
})
