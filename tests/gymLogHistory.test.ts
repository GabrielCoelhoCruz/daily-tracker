import type { GymSession } from '../stores/slices/gymLogSlice'
import { formatGymSessionsForHistory } from '../utils/gymLogUtils'

describe('formatGymSessionsForHistory', () => {
  const mockSession: GymSession = {
    id: 's1',
    treinoId: 'treino-a',
    treinoNome: 'Treino A — Peito',
    date: '2026-06-26',
    logs: [
      {
        exercicioId: 'a1',
        nome: 'Supino inclinado máquina/hammer',
        series: 4,
        repeticoes: 0,
        cargaKg: 80,
      },
      {
        exercicioId: 'a2',
        nome: 'Crucifixo inclinado halteres',
        series: 3,
        repeticoes: 15,
      },
    ],
  }

  it('formata título e linhas com carga', () => {
    const result = formatGymSessionsForHistory([mockSession])
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Treino A — Peito')
    expect(result[0].lines[0]).toBe('Supino inclinado máquina/hammer: 80 kg')
  })

  it('linha sem carga usa em dash', () => {
    const result = formatGymSessionsForHistory([mockSession])
    expect(result[0].lines[1]).toBe('Crucifixo inclinado halteres: —')
  })

  it('retorna array vazio para sessões vazias', () => {
    expect(formatGymSessionsForHistory([])).toEqual([])
  })
})
