import { treinos } from '../data/treinos'
import {
  resolveGymSessionForTreino,
  updateGymSessionCarga,
  buildTreinoSessionNome,
} from '../utils/gymLogUtils'
import { createGymLogSlice } from '../stores/slices/gymLogSlice'

describe('useGymSession logic', () => {
  const treinoA = treinos[0]
  const date = '2026-06-26'

  function freshStore() {
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

  it('treino null → isLogging seria false (sem sessão)', () => {
    const store = freshStore()
    expect(store.getActiveSessionForTreinoAndDate('x', date)).toBeUndefined()
  })

  it('startSession cria sessão com exercícios do treino', () => {
    const store = freshStore()
    const session = resolveGymSessionForTreino(treinoA, date, store)
    expect(session.treinoId).toBe(treinoA.id)
    expect(session.treinoNome).toBe(buildTreinoSessionNome(treinoA))
    expect(session.logs).toHaveLength(treinoA.exercicios.length)
  })

  it('startSession retorna sessão existente sem duplicar', () => {
    const store = freshStore()
    const first = resolveGymSessionForTreino(treinoA, date, store)
    const second = resolveGymSessionForTreino(treinoA, date, store)
    expect(second.id).toBe(first.id)
    expect(store.getGymSessionsByDate(date)).toHaveLength(1)
  })

  it('updateCarga atualiza log do exercício', () => {
    const store = freshStore()
    const session = resolveGymSessionForTreino(treinoA, date, store)
    updateGymSessionCarga(session, treinoA.exercicios[0].id, 80, store)
    const updated = store.getGymSessionById(session.id)!
    expect(updated.logs[0].cargaKg).toBe(80)
  })

  it('session = getActiveSessionForTreinoAndDate', () => {
    const store = freshStore()
    resolveGymSessionForTreino(treinoA, date, store)
    const active = store.getActiveSessionForTreinoAndDate(treinoA.id, date)
    expect(active).toBeDefined()
    expect(active?.treinoId).toBe(treinoA.id)
  })
})
