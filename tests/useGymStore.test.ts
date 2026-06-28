jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

import { useGymStore } from '../stores/useGymStore'
import { treinos } from '../data/treinos'

describe('useGymStore', () => {
  const mockExs = treinos[0].exercicios.slice(0, 2)

  beforeEach(() => {
    useGymStore.setState({ gymSessions: {} })
  })

  it('inicia com gymSessions vazio', () => {
    expect(useGymStore.getState().gymSessions).toEqual({})
  })

  it('startGymSession persiste estrutura esperada em memória', () => {
    const id = useGymStore
      .getState()
      .startGymSession('treino-a', 'Treino A', '2026-06-26', mockExs)
    const session = useGymStore.getState().getGymSessionById(id)
    expect(session?.treinoId).toBe('treino-a')
    expect(session?.date).toBe('2026-06-26')
    expect(session?.logs).toHaveLength(2)
    expect(session?.logs[0].sets?.length).toBeGreaterThan(0)
    expect(useGymStore.getState().gymSessions[id]).toBeDefined()
  })

  it('getGymSessionsByDate funciona via store', () => {
    useGymStore.getState().startGymSession('1', 'A', '2026-06-26', mockExs)
    useGymStore.getState().startGymSession('2', 'B', '2026-06-25', mockExs)
    expect(useGymStore.getState().getGymSessionsByDate('2026-06-26')).toHaveLength(1)
    expect(useGymStore.getState().getGymSessionsByDate('2026-06-25')).toHaveLength(1)
  })
})
