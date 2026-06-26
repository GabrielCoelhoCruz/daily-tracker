import type { Exercicio, Treino } from '@/data/treinos'
import type { GymExercise, GymSession } from '@/stores/slices/gymLogSlice'

function getTotalSets(exercicio: Exercicio): number {
  return exercicio.series.reduce((acc, s) => acc + s.series, 0)
}

function getFirstNumericReps(exercicio: Exercicio): number {
  for (const s of exercicio.series) {
    if (typeof s.reps === 'number') {
      return s.reps
    }
  }
  return 0
}

export function treinoToGymExercises(treino: Treino): GymExercise[] {
  return treino.exercicios.map((ex) => ({
    id: ex.id,
    nome: ex.nome,
    series: getTotalSets(ex),
    repeticoes: getFirstNumericReps(ex),
  }))
}

export function buildTreinoSessionNome(treino: Treino): string {
  return `Treino ${treino.letra} — ${treino.grupoMuscular}`
}

export type GymSessionController = {
  getActiveSessionForTreinoAndDate: (
    treinoId: string,
    date: string,
  ) => GymSession | undefined
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
    updates: Partial<{ cargaKg: number }>,
  ) => void
}

export function resolveGymSessionForTreino(
  treino: Treino,
  date: string,
  store: GymSessionController,
): GymSession {
  const existing = store.getActiveSessionForTreinoAndDate(treino.id, date)
  if (existing) return existing

  const exercises = treinoToGymExercises(treino)
  const sessionId = store.startGymSession(
    treino.id,
    buildTreinoSessionNome(treino),
    date,
    exercises,
  )
  return store.getGymSessionById(sessionId)!
}

export function updateGymSessionCarga(
  session: GymSession | undefined,
  exercicioId: string,
  cargaKg: number,
  store: Pick<GymSessionController, 'updateExerciseLog'>,
): void {
  if (!session) return
  store.updateExerciseLog(session.id, exercicioId, { cargaKg })
}

export function formatGymSessionsForHistory(
  sessions: GymSession[],
): { title: string; lines: string[] }[] {
  return sessions.map((session) => ({
    title: session.treinoNome,
    lines: session.logs.map((log) =>
      log.cargaKg != null ? `${log.nome}: ${log.cargaKg} kg` : `${log.nome}: —`,
    ),
  }))
}
