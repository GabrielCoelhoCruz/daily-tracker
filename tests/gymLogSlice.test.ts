import { createGymLogSlice } from '../stores/slices/gymLogSlice'

describe('GymLogSlice', () => {
  const mockExs = [
    { id: 'e1', nome: 'Supino Reto', series: 4, repeticoes: 10 },
    { id: 'e2', nome: 'Desenvolvimento', series: 3, repeticoes: 12 },
  ]

  function fresh() {
    const state: any = {}
    const api = {
      set: (fn: any) => {
        const r = fn(state)
        Object.assign(state, r)
        return r
      },
      get: () => state,
    }
    const slice = createGymLogSlice(api.set as any, api.get as any, api as any)
    Object.assign(state, slice)
    return slice
  }

  it('startGymSession — cria sessão com exercícios', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'Treino A', '2026-06-26', mockExs)
    const sess = s.getGymSessionById(id)
    expect(sess?.treinoNome).toBe('Treino A')
    expect(sess?.logs).toHaveLength(2)
    expect(sess?.logs[0].cargaKg).toBeUndefined()
  })

  it('startGymSession — IDs únicos', () => {
    const s = fresh()
    const a = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    const b = s.startGymSession('2', 'B', '2026-06-26', mockExs)
    expect(a).not.toBe(b)
  })

  it('updateExerciseLog — atualiza carga', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    s.updateExerciseLog(id, 'e1', { cargaKg: 80 })
    expect(s.getGymSessionById(id)!.logs[0].cargaKg).toBe(80)
  })

  it('updateExerciseLog — não afeta outros exercícios', () => {
    const s = fresh()
    const id = s.startGymSession('1', 'A', '2026-06-26', mockExs)
    s.updateExerciseLog(id, 'e1', { cargaKg: 80 })
    expect(s.getGymSessionById(id)!.logs[1].cargaKg).toBeUndefined()
  })

  it('updateExerciseLog — sessão inexistente não quebra', () => {
    const s = fresh()
    expect(() => s.updateExerciseLog('fake', 'e1', { cargaKg: 80 })).not.toThrow()
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
    s.removeExerciseLog(id, 'e1')
    expect(s.getGymSessionById(id)!.logs).toHaveLength(1)
    expect(s.getGymSessionById(id)!.logs[0].exercicioId).toBe('e2')
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
