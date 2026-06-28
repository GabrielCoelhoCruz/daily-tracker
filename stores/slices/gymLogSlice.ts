import type { StateCreator } from 'zustand'
import type { Exercicio } from '@/data/treinos'
import {
  buildExerciseSetLogs,
  normalizeGymSession,
} from '@/utils/trainingPerformanceUtils'

export type TrainingSetType =
  | 'warmup'
  | 'working'
  | 'top'
  | 'backoff'
  | 'drop'
  | 'cluster'

export type TrainingSetLog = {
  id: string
  setNumber: number
  plannedSetType: TrainingSetType
  completedSetType: TrainingSetType
  plannedReps: number | string | null
  targetReps: number | string | null
  loadKg: number | null
  repsCompleted: number | null
  rpe: number | null
  rir: number | null
  isFailure: boolean
  isCompleted: boolean
  completedAt: string | null
  note?: string
}

/** @deprecated Use Exercicio[] with buildExerciseSetLogs instead */
export type GymExercise = {
  id: string
  nome: string
  series: number
  repeticoes: number
}

export type ExerciseLog = {
  exercicioId: string
  nome: string
  plannedSets?: number
  sets?: TrainingSetLog[]
  note?: string
  /** @deprecated legacy field */
  series?: number
  /** @deprecated legacy field */
  repeticoes?: number
  /** @deprecated legacy field */
  cargaKg?: number
}

export type GymSession = {
  id: string
  treinoId: string
  treinoNome: string
  date: string
  startedAt: string
  completedAt: string | null
  logs: ExerciseLog[]
}

export type GymLogState = {
  gymSessions: Record<string, GymSession>
}

export type GymLogActions = {
  startGymSession: (
    treinoId: string,
    treinoNome: string,
    date: string,
    exercicios: Exercicio[],
  ) => string
  getGymSessionById: (id: string) => GymSession | undefined
  /** @deprecated use updateTrainingSetLog */
  updateExerciseLog: (
    sessionId: string,
    exercicioId: string,
    updates: Partial<Pick<ExerciseLog, 'cargaKg'>>,
  ) => void
  updateTrainingSetLog: (
    sessionId: string,
    exercicioId: string,
    setId: string,
    updates: Partial<
      Pick<
        TrainingSetLog,
        | 'loadKg'
        | 'repsCompleted'
        | 'isFailure'
        | 'rpe'
        | 'rir'
        | 'completedSetType'
        | 'note'
      >
    >,
  ) => void
  completeTrainingSet: (
    sessionId: string,
    exercicioId: string,
    setId: string,
    data?: {
      loadKg?: number
      repsCompleted?: number
      isFailure?: boolean
    },
  ) => void
  undoTrainingSet: (
    sessionId: string,
    exercicioId: string,
    setId: string,
  ) => void
  finishGymSession: (sessionId: string) => void
  deleteGymSession: (sessionId: string) => void
  getGymSessionsByDate: (date: string) => GymSession[]
  getActiveSessionForTreinoAndDate: (
    treinoId: string,
    date: string,
  ) => GymSession | undefined
  removeExerciseLog: (sessionId: string, exercicioId: string) => void
}

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

function mapExerciseToLog(exercicio: Exercicio): ExerciseLog {
  const sets = buildExerciseSetLogs(exercicio)
  return {
    exercicioId: exercicio.id,
    nome: exercicio.nome,
    plannedSets: sets.length,
    sets,
  }
}

function updateSetInSession(
  session: GymSession,
  exercicioId: string,
  setId: string,
  updater: (set: TrainingSetLog) => TrainingSetLog,
): GymSession {
  return {
    ...session,
    logs: session.logs.map((log) => {
      if (log.exercicioId !== exercicioId) return log
      const sets = log.sets ?? []
      return {
        ...log,
        sets: sets.map((set) => (set.id === setId ? updater(set) : set)),
      }
    }),
  }
}

export const createGymLogSlice: StateCreator<
  GymLogState & GymLogActions,
  [],
  [],
  GymLogState & GymLogActions
> = (set, get) => ({
  gymSessions: {},

  startGymSession: (treinoId, treinoNome, date, exercicios) => {
    const id = generateId()
    const now = new Date().toISOString()
    const session: GymSession = {
      id,
      treinoId,
      treinoNome,
      date,
      startedAt: now,
      completedAt: null,
      logs: exercicios.map(mapExerciseToLog),
    }
    set((state) => ({
      gymSessions: { ...state.gymSessions, [id]: session },
    }))
    return id
  },

  getGymSessionById: (id) => {
    const session = get().gymSessions[id]
    return session ? normalizeGymSession(session) : undefined
  },

  updateExerciseLog: (sessionId, exercicioId, updates) => {
    set((state) => {
      const session = state.gymSessions[sessionId]
      if (!session) return state
      return {
        gymSessions: {
          ...state.gymSessions,
          [sessionId]: {
            ...session,
            logs: session.logs.map((log) => {
              if (log.exercicioId !== exercicioId) return log
              const normalized = normalizeGymSession({
                ...session,
                logs: [log],
              }).logs[0]
              const sets = normalized.sets ?? []
              const firstSet = sets[0]
              if (!firstSet || updates.cargaKg == null) {
                return { ...log, ...updates }
              }
              return {
                ...normalized,
                cargaKg: updates.cargaKg,
                sets: sets.map((set, index) =>
                  index === 0
                    ? {
                        ...set,
                        loadKg: updates.cargaKg ?? set.loadKg,
                        isCompleted: true,
                      }
                    : set,
                ),
              }
            }),
          },
        },
      }
    })
  },

  updateTrainingSetLog: (sessionId, exercicioId, setId, updates) => {
    set((state) => {
      const session = state.gymSessions[sessionId]
      if (!session) return state
      const updated = updateSetInSession(session, exercicioId, setId, (set) => ({
        ...set,
        ...updates,
      }))
      return {
        gymSessions: {
          ...state.gymSessions,
          [sessionId]: updated,
        },
      }
    })
  },

  completeTrainingSet: (sessionId, exercicioId, setId, data) => {
    set((state) => {
      const session = state.gymSessions[sessionId]
      if (!session) return state
      const updated = updateSetInSession(session, exercicioId, setId, (set) => ({
        ...set,
        loadKg: data?.loadKg ?? set.loadKg,
        repsCompleted: data?.repsCompleted ?? set.repsCompleted,
        isFailure: data?.isFailure ?? set.isFailure,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      }))
      return {
        gymSessions: {
          ...state.gymSessions,
          [sessionId]: updated,
        },
      }
    })
  },

  undoTrainingSet: (sessionId, exercicioId, setId) => {
    set((state) => {
      const session = state.gymSessions[sessionId]
      if (!session) return state
      const updated = updateSetInSession(session, exercicioId, setId, (set) => ({
        ...set,
        isCompleted: false,
        completedAt: null,
        isFailure: false,
      }))
      return {
        gymSessions: {
          ...state.gymSessions,
          [sessionId]: updated,
        },
      }
    })
  },

  finishGymSession: (sessionId) => {
    set((state) => {
      const session = state.gymSessions[sessionId]
      if (!session) return state
      return {
        gymSessions: {
          ...state.gymSessions,
          [sessionId]: {
            ...session,
            completedAt: new Date().toISOString(),
          },
        },
      }
    })
  },

  deleteGymSession: (sessionId) => {
    set((state) => {
      const { [sessionId]: _removed, ...rest } = state.gymSessions
      return { gymSessions: rest }
    })
  },

  getGymSessionsByDate: (date) =>
    Object.values(get().gymSessions)
      .filter((s) => s.date === date)
      .map((s) => normalizeGymSession(s)),

  getActiveSessionForTreinoAndDate: (treinoId, date) => {
    const session = Object.values(get().gymSessions).find(
      (s) => s.treinoId === treinoId && s.date === date,
    )
    return session ? normalizeGymSession(session) : undefined
  },

  removeExerciseLog: (sessionId, exercicioId) => {
    set((state) => {
      const session = state.gymSessions[sessionId]
      if (!session) return state
      return {
        gymSessions: {
          ...state.gymSessions,
          [sessionId]: {
            ...session,
            logs: session.logs.filter((log) => log.exercicioId !== exercicioId),
          },
        },
      }
    })
  },
})
