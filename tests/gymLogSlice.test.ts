import { createGymLogSlice } from '../stores/slices/gymLogSlice'
import { treinos } from '../data/treinos'

describe('GymLogSlice', () => {
  const treinoA = treinos[0]
  const mockExs = treinoA.exercicios.slice(0, 2)

  function fresh() {
    const state: Record<string, unknown> = {}
    const api = {
      set: (fn: (s: typeof state) => Partial<typeof state>) => {
        const r = fn(state)
        Object.assign(state, r)
        return r
      },
      get: () => state,
    }
    const slice = createGymLogSlice(api.set as never, api.get as never, api as never)
    Object.assign(state, slice)
    return slice
  }

  it('startGymSession — cria sessão com exercícios e sets', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'Treino A', '2026-06-26', mockExs)
    const sess = s.getGymSessionById(id)
    expect(sess?.treinoNome).toBe('Treino A')
    expect(sess?.logs).toHaveLength(2)
    expect(sess?.logs[0].sets?.length).toBeGreaterThan(0)
    expect(sess?.startedAt).toBeDefined()
    expect(sess?.completedAt).toBeNull()
  })

  it('startGymSession — IDs únicos', () => {
    const s = fresh()
    const a = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    const b = s.startGymSession('2', 'B', '2026-06-26', mockExs)
    expect(a).not.toBe(b)
  })

  it('updateExerciseLog — atualiza carga no primeiro set (legacy)', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    s.updateExerciseLog(id, 'a1', { cargaKg: 80 })
    const log = s.getGymSessionById(id)!.logs[0]
    expect(log.cargaKg).toBe(80)
    expect(log.sets?.[0].loadKg).toBe(80)
  })

  it('updateTrainingSetLog — atualiza carga e reps', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    const setId = s.getGymSessionById(id)!.logs[0].sets![0].id
    s.updateTrainingSetLog(id, 'a1', setId, { loadKg: 80, repsCompleted: 10 })
    const set = s.getGymSessionById(id)!.logs[0].sets![0]
    expect(set.loadKg).toBe(80)
    expect(set.repsCompleted).toBe(10)
  })

  it('completeTrainingSet — completa set', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    const setId = s.getGymSessionById(id)!.logs[0].sets![0].id
    s.completeTrainingSet(id, 'a1', setId, { loadKg: 80, repsCompleted: 8 })
    const set = s.getGymSessionById(id)!.logs[0].sets![0]
    expect(set.isCompleted).toBe(true)
    expect(set.completedAt).toBeTruthy()
  })

  it('undoTrainingSet — desfaz set', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    const setId = s.getGymSessionById(id)!.logs[0].sets![0].id
    s.completeTrainingSet(id, 'a1', setId, { loadKg: 80, repsCompleted: 8 })
    s.undoTrainingSet(id, 'a1', setId)
    const set = s.getGymSessionById(id)!.logs[0].sets![0]
    expect(set.isCompleted).toBe(false)
    expect(set.completedAt).toBeNull()
  })

  it('finishGymSession — finaliza sessão', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    s.finishGymSession(id)
    expect(s.getGymSessionById(id)?.completedAt).toBeTruthy()
  })

  it('updateExerciseLog — não afeta outros exercícios', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    s.updateExerciseLog(id, 'a1', { cargaKg: 80 })
    expect(s.getGymSessionById(id)!.logs[1].cargaKg).toBeUndefined()
  })

  it('updateExerciseLog — sessão inexistente não quebra', () => {
    const s = fresh()
    expect(() => s.updateExerciseLog('fake', 'a1', { cargaKg: 80 })).not.toThrow()
  })

  it('deleteGymSession — remove apenas a sessão alvo', () => {
    const s = fresh()
    const a = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    const b = s.startGymSession('2', 'B', '2026-06-26', mockExs)
    s.deleteGymSession(a)
    expect(s.getGymSessionById(a)).toBeUndefined()
    expect(s.getGymSessionById(b)).toBeDefined()
  })

  it('getGymSessionsByDate — filtra por data', () => {
    const s = fresh()
    s.startGymSession('1', 'A', '2026-06-26', mockExs)
    s.startGymSession('2', 'B', '2026-06-26', mockExs)
    s.startGymSession('3', 'C', '2026-06-25', mockExs)
    expect(s.getGymSessionsByDate('2026-06-26')).toHaveLength(2)
    expect(s.getGymSessionsByDate('2026-06-25')).toHaveLength(1)
    expect(s.getGymSessionsByDate('2020-01-01')).toHaveLength(0)
  })

  it('removeExerciseLog — remove exercício específico', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    s.removeExerciseLog(id, 'a1')
    expect(s.getGymSessionById(id)!.logs).toHaveLength(1)
    expect(s.getGymSessionById(id)!.logs[0].exercicioId).toBe('a2')
  })

  it('getActiveSessionForTreinoAndDate — retorna sessão existente', () => {
    const s = fresh()
    const id = s.startGymSession('treino-a', 'Treino A', '2026-06-26', mockExs)
    const active = s.getActiveSessionForTreinoAndDate('treino-a', '2026-06-26')
    expect(active?.id).toBe(id)
    expect(active?.treinoId).toBe('treino-a')
  })

  it('getActiveSessionForTreinoAndDate — undefined se treino ou data diferente', () => {
    const s = fresh()
    s.startGymSession('treino-a', 'Treino A', '2026-06-26', mockExs)
    expect(s.getActiveSessionForTreinoAndDate('treino-b', '2026-06-26')).toBeUndefined()
    expect(s.getActiveSessionForTreinoAndDate('treino-a', '2026-06-25')).toBeUndefined()
  })
})
