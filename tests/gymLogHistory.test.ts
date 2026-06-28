import type { GymSession } from '../stores/slices/gymLogSlice'
import { treinos } from '../data/treinos'
import { buildExerciseSetLogs } from '../utils/trainingPerformanceUtils'
import { formatGymSessionsForHistory } from '../utils/gymLogUtils'

describe('formatGymSessionsForHistory', () => {
  const exercicio = treinos[0].exercicios[0]
  const sets = buildExerciseSetLogs(exercicio).map((set, index) => ({
    ...set,
    loadKg: index === 0 ? 80 : null,
    repsCompleted: index === 0 ? 8 : null,
    isCompleted: index === 0,
    completedAt: index === 0 ? '2026-06-26T10:00:00.000Z' : null,
  }))

  const mockSession: GymSession = {
    id: 's1',
    treinoId: 'treino-a',
    treinoNome: 'Treino A — Peito',
    date: '2026-06-26',
    startedAt: '2026-06-26T09:00:00.000Z',
    completedAt: null,
    logs: [
      {
        exercicioId: 'a1',
        nome: 'Supino inclinado máquina/hammer',
        plannedSets: sets.length,
        sets,
      },
      {
        exercicioId: 'a2',
        nome: 'Crucifixo inclinado halteres',
        plannedSets: 3,
        series: 3,
        repeticoes: 15,
      },
    ],
  }

  it('formata título e linhas com carga', () => {
    const result = formatGymSessionsForHistory([mockSession])
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Treino A — Peito')
    expect(result[0].lines[0]).toBe('Supino inclinado máquina/hammer: 80 kg x 8')
  })

  it('linha sem carga usa em dash', () => {
    const result = formatGymSessionsForHistory([mockSession])
    expect(result[0].lines[1]).toBe('Crucifixo inclinado halteres: —')
  })

  it('retorna array vazio para sessões vazias', () => {
    expect(formatGymSessionsForHistory([])).toEqual([])
  })
})
