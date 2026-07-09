import { describe, expect, test } from 'vitest'
import { evaluateGuess } from './guess'

describe('evaluateGuess', () => {
  test('acerto exato, ignorando maiúsculas', () => {
    expect(evaluateGuess('TITANIC', 'Titanic')).toBe('acertou')
  })

  test('acerto ignorando acentos', () => {
    expect(evaluateGuess('Pele', 'Pelé')).toBe('acertou')
  })

  test('acerto ignorando artigo inicial', () => {
    expect(evaluateGuess('rei leão', 'O Rei Leão')).toBe('acertou')
  })

  test('acerto com espaços e pontuação extras', () => {
    expect(evaluateGuess('  pac man ', 'Pac-Man')).toBe('acertou')
  })

  test('erro pequeno de digitação ainda conta como acerto', () => {
    expect(evaluateGuess('Titanik', 'Titanic')).toBe('acertou')
  })

  test('parte da resposta fica perto', () => {
    expect(evaluateGuess('leão', 'O Rei Leão')).toBe('perto')
  })

  test('uma palavra certa da resposta fica perto', () => {
    expect(evaluateGuess('copa', 'Copa do Mundo')).toBe('perto')
  })

  test('resposta parecida mas errada fica chegando', () => {
    expect(evaluateGuess('copa america', 'Copa do Mundo')).toBe('chegando')
  })

  test('resposta sem relação fica longe', () => {
    expect(evaluateGuess('banana', 'Titanic')).toBe('longe')
  })

  test('palpite vazio fica longe', () => {
    expect(evaluateGuess('   ', 'Titanic')).toBe('longe')
  })
})
