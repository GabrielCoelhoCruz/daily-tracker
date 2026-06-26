import { treinos } from '../data/treinos'
import { treinoToGymExercises } from '../utils/gymLogUtils'

describe('treinoToGymExercises', () => {
  it('Treino A — mesmo length que exercicios', () => {
    const treinoA = treinos[0]
    const result = treinoToGymExercises(treinoA)
    expect(result).toHaveLength(treinoA.exercicios.length)
    expect(result[0].id).toBe(treinoA.exercicios[0].id)
    expect(result[0].nome).toBe(treinoA.exercicios[0].nome)
  })

  it('WS+TS — soma séries corretamente', () => {
    const treinoA = treinos[0]
    const first = treinoToGymExercises(treinoA)[0]
    // a1: WS 2 + TS 2 = 4
    expect(first.series).toBe(4)
  })

  it('sem reps numérico → repeticoes: 0', () => {
    const treinoA = treinos[0]
    const withoutNumericReps = treinoToGymExercises(treinoA).find(
      (ex) => ex.id === 'a1',
    )
    expect(withoutNumericReps?.repeticoes).toBe(0)

    const withStringReps = treinoToGymExercises(treinoA).find(
      (ex) => ex.id === 'a4',
    )
    expect(withStringReps?.repeticoes).toBe(0)
  })

  it('primeira rep numérica nas séries', () => {
    const treinoA = treinos[0]
    const withNumericReps = treinoToGymExercises(treinoA).find(
      (ex) => ex.id === 'a3',
    )
    expect(withNumericReps?.repeticoes).toBe(15)
  })
})
