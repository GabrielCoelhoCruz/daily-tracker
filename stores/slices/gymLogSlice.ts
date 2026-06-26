import type { StateCreator } from 'zustand'

export type GymExercise = {
  id: string
  nome: string
  series: number
  repeticoes: number
}

export type ExerciseLog = {
  exercicioId: string
  nome: string
  series: number
  repeticoes: number
  cargaKg?: number
}

export type GymSession = {
  id: string
  treinoId: string
  treinoNome: string
  date: string
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
    exercises: GymExercise[],
  ) => string
  getGymSessionById: (id: string) => GymSession | undefined
  updateExerciseLog: (
    sessionId: string,
    exercicioId: string,
    updates: Partial<Pick<ExerciseLog, 'cargaKg'>>,
  ) => void
  deleteGymSession: (sessionId: string) => void
  getGymSessionsByDate: (date: string) => GymSession[]
  removeExerciseLog: (sessionId: string, exercicioId: string) => void
}

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export const createGymLogSlice: StateCreator<
  GymLogState & GymLogActions,
  [],
  [],
  GymLogState & GymLogActions
> = (set, get) => ({
  gymSessions: {},

  startGymSession: (treinoId, treinoNome, date, exercises) => {
    const id = generateId()
    const session: GymSession = {
      id,
      treinoId,
      treinoNome,
      date,
      logs: exercises.map((ex) => ({
        exercicioId: ex.id,
        nome: ex.nome,
        series: ex.series,
        repeticoes: ex.repeticoes,
      })),
    }
    set((state) => ({
      gymSessions: { ...state.gymSessions, [id]: session },
    }))
    return id
  },

  getGymSessionById: (id) => get().gymSessions[id],

  updateExerciseLog: (sessionId, exercicioId, updates) => {
    set((state) => {
      const session = state.gymSessions[sessionId]
      if (!session) return state
      return {
        gymSessions: {
          ...state.gymSessions,
          [sessionId]: {
            ...session,
            logs: session.logs.map((log) =>
              log.exercicioId === exercicioId ? { ...log, ...updates } : log,
            ),
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
    Object.values(get().gymSessions).filter((s) => s.date === date),

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
