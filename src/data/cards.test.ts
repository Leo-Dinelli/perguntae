import { describe, expect, test } from 'vitest'
import { ALL_CARDS, RELATIONSHIP_CARDS } from './cards'
import { THEMES } from '../game/types'

describe('banco de cartas', () => {
  test('todas as cartas têm exatamente 20 dicas não vazias', () => {
    for (const card of ALL_CARDS) {
      expect(card.hints, `carta ${card.id}`).toHaveLength(20)
      expect(
        card.hints.every((h) => h.trim().length > 0),
        `carta ${card.id} tem dica vazia`,
      ).toBe(true)
    }
  })

  test('IDs são únicos', () => {
    const ids = ALL_CARDS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('respostas não vazias e sem duplicatas dentro do mesmo tema', () => {
    for (const theme of THEMES) {
      const answers = ALL_CARDS.filter((c) => c.theme === theme).map((c) =>
        c.answer.toLowerCase(),
      )
      expect(new Set(answers).size, `tema ${theme}`).toBe(answers.length)
    }
  })

  test('cada tema tem pelo menos 5 cartas por dificuldade', () => {
    for (const theme of THEMES) {
      for (const difficulty of ['facil', 'medio', 'dificil'] as const) {
        const count = ALL_CARDS.filter(
          (c) => c.theme === theme && c.difficulty === difficulty,
        ).length
        expect(count, `${theme}/${difficulty}`).toBeGreaterThanOrEqual(5)
      }
    }
  })

  test('nenhuma dica revela a resposta literalmente', () => {
    for (const card of ALL_CARDS) {
      const answer = card.answer.toLowerCase()
      for (const hint of card.hints) {
        expect(
          hint.toLowerCase().includes(answer),
          `carta ${card.id}: dica "${hint}" contém a resposta`,
        ).toBe(false)
      }
    }
  })
})

describe('cartas de relacionamento', () => {
  test('cada profundidade tem pelo menos 15 perguntas', () => {
    for (const depth of ['leve', 'medio', 'profundo'] as const) {
      const count = RELATIONSHIP_CARDS.filter((c) => c.depth === depth).length
      expect(count, `profundidade ${depth}`).toBeGreaterThanOrEqual(15)
    }
  })

  test('IDs únicos e perguntas não vazias', () => {
    const ids = RELATIONSHIP_CARDS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(RELATIONSHIP_CARDS.every((c) => c.prompt.trim().length > 10)).toBe(
      true,
    )
  })
})
