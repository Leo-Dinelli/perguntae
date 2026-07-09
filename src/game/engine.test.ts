import { describe, expect, test } from 'vitest'
import {
  availableThemes,
  buildDeck,
  correctGuess,
  createMatch,
  drawCard,
  giveUp,
  revealHint,
  scoreForGuess,
  skipCard,
  winners,
} from './engine'
import type { AnswerCard, Difficulty, MatchConfig, ThemeId } from './types'

function card(
  id: string,
  theme: ThemeId,
  difficulty: Difficulty = 'facil',
): AnswerCard {
  return {
    id,
    theme,
    difficulty,
    answer: `resposta-${id}`,
    hints: Array.from({ length: 20 }, (_, i) => `dica ${i + 1} de ${id}`),
  }
}

const POOL: AnswerCard[] = [
  card('e1', 'esportes'),
  card('e2', 'esportes'),
  card('c1', 'comida'),
  card('l1', 'lugares'),
  card('o1', 'objetos', 'medio'),
  card('p1', 'pessoas'),
]

const CONFIG: MatchConfig = {
  themeChoice: 'geral',
  difficulty: 'facil',
  totalRounds: 3,
}

// rng determinístico simples (LCG) para testes reproduzíveis
function seededRng(seed = 42) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
}

describe('scoreForGuess', () => {
  test('acertar na 1ª dica vale 20 pontos', () => {
    expect(scoreForGuess(1)).toBe(20)
  })

  test('acertar na 5ª dica vale 16 pontos', () => {
    expect(scoreForGuess(5)).toBe(16)
  })

  test('acertar na 20ª dica vale 1 ponto', () => {
    expect(scoreForGuess(20)).toBe(1)
  })

  test('nunca vale menos que 1 ponto', () => {
    expect(scoreForGuess(25)).toBe(1)
  })
})

describe('buildDeck', () => {
  test('filtra por tema', () => {
    const deck = buildDeck(POOL, 'esportes', 'facil', seededRng())
    expect(deck.map((c) => c.id).sort()).toEqual(['e1', 'e2'])
  })

  test("'geral' inclui todos os temas", () => {
    const deck = buildDeck(POOL, 'geral', 'facil', seededRng())
    expect(deck.map((c) => c.id).sort()).toEqual([
      'c1',
      'e1',
      'e2',
      'l1',
      'o1',
      'p1',
    ])
  })

  test('não muta o pool original', () => {
    const before = POOL.map((c) => c.id)
    buildDeck(POOL, 'geral', 'facil', seededRng())
    expect(POOL.map((c) => c.id)).toEqual(before)
  })
})

describe('mix de dificuldade', () => {
  const bigPool: AnswerCard[] = []
  for (let i = 0; i < 60; i++) {
    bigPool.push(card(`bf${i}`, 'esportes', 'facil'))
    bigPool.push(card(`bm${i}`, 'esportes', 'medio'))
    bigPool.push(card(`bd${i}`, 'esportes', 'dificil'))
  }

  test('modo fácil prioriza fáceis (~70%) mas mistura médias e difíceis', () => {
    const deck = buildDeck(bigPool, 'esportes', 'facil', seededRng())
    expect(deck).toHaveLength(180)
    const first20 = deck.slice(0, 20)
    const count = (d: Difficulty) =>
      first20.filter((c) => c.difficulty === d).length
    expect(count('facil')).toBeGreaterThanOrEqual(10)
    expect(count('facil')).toBeLessThanOrEqual(18)
    expect(count('medio') + count('dificil')).toBeGreaterThanOrEqual(2)
  })

  test('modo difícil é o espelho: maioria difícil, com respiros', () => {
    const deck = buildDeck(bigPool, 'esportes', 'dificil', seededRng(7))
    const first20 = deck.slice(0, 20)
    const dificeis = first20.filter((c) => c.difficulty === 'dificil').length
    expect(dificeis).toBeGreaterThanOrEqual(10)
    expect(first20.some((c) => c.difficulty !== 'dificil')).toBe(true)
  })

  test('cai para o que existir quando falta alguma dificuldade no pool', () => {
    const deck = buildDeck(POOL, 'esportes', 'medio', seededRng())
    expect(deck.map((c) => c.id).sort()).toEqual(['e1', 'e2'])
  })
})

describe('skipCard', () => {
  test('descarta a carta sem pontuar e sem contar rodada', () => {
    let state = drawCard(createMatch(['A', 'B'], POOL, CONFIG, seededRng()))
    const burnedId = state.current!.card.id
    const deckLen = state.deck.length
    state = skipCard(state)
    expect(state.current).toBeNull()
    expect(state.roundsPlayed).toBe(0)
    expect(state.teams.every((t) => t.score === 0)).toBe(true)
    expect(state.deck).toHaveLength(deckLen)
    expect(state.deck.find((c) => c.id === burnedId)).toBeUndefined()
    expect(state.finished).toBe(false)
  })

  test('encerra a partida se o baralho acabar ao pular', () => {
    let state = createMatch(
      ['A', 'B'],
      POOL,
      { themeChoice: 'esportes', difficulty: 'facil', totalRounds: 10 },
      seededRng(),
    )
    state = skipCard(drawCard(state))
    expect(state.finished).toBe(false)
    state = skipCard(drawCard(state))
    expect(state.finished).toBe(true)
  })

  test('não faz nada se a rodada já foi resolvida', () => {
    let state = drawCard(createMatch(['A', 'B'], POOL, CONFIG, seededRng()))
    state = correctGuess(state, state.teams[0].id)
    const after = skipCard(state)
    expect(after).toBe(state)
  })
})

describe('createMatch', () => {
  test('cria times com placar zerado e nomes dados', () => {
    const state = createMatch(['Azul', 'Vermelho'], POOL, CONFIG, seededRng())
    expect(state.teams).toHaveLength(2)
    expect(state.teams.map((t) => t.name)).toEqual(['Azul', 'Vermelho'])
    expect(state.teams.every((t) => t.score === 0)).toBe(true)
    expect(state.roundsPlayed).toBe(0)
    expect(state.current).toBeNull()
    expect(state.finished).toBe(false)
  })
})

describe('drawCard', () => {
  test('saca uma carta com 1 dica revelada e a remove do baralho', () => {
    const state = createMatch(['A', 'B'], POOL, CONFIG, seededRng())
    const next = drawCard(state)
    expect(next.current).not.toBeNull()
    expect(next.current!.revealed).toBe(1)
    expect(next.current!.resolved).toBe('pending')
    expect(next.deck).toHaveLength(state.deck.length - 1)
    expect(next.deck.find((c) => c.id === next.current!.card.id)).toBeUndefined()
  })

  test('respeita o tema pedido (roleta)', () => {
    const state = createMatch(['A', 'B'], POOL, CONFIG, seededRng())
    const next = drawCard(state, 'comida')
    expect(next.current!.card.theme).toBe('comida')
  })

  test('nunca repete carta entre rodadas', () => {
    let state = createMatch(['A', 'B'], POOL, {
      ...CONFIG,
      totalRounds: 5,
    }, seededRng())
    const seen: string[] = []
    for (let i = 0; i < 5; i++) {
      state = drawCard(state)
      seen.push(state.current!.card.id)
      state = giveUp(state)
    }
    expect(new Set(seen).size).toBe(5)
  })
})

describe('revealHint', () => {
  test('incrementa dicas reveladas até o máximo de 20', () => {
    let state = drawCard(createMatch(['A', 'B'], POOL, CONFIG, seededRng()))
    for (let i = 0; i < 25; i++) state = revealHint(state)
    expect(state.current!.revealed).toBe(20)
  })
})

describe('correctGuess', () => {
  test('dá 21 - dicas reveladas ao time que acertou e conclui a rodada', () => {
    let state = drawCard(createMatch(['A', 'B'], POOL, CONFIG, seededRng()))
    state = revealHint(state) // 2 dicas
    state = revealHint(state) // 3 dicas
    const teamB = state.teams[1].id
    state = correctGuess(state, teamB)
    expect(state.teams[1].score).toBe(18)
    expect(state.teams[0].score).toBe(0)
    expect(state.current!.resolved).toBe('guessed')
    expect(state.current!.winnerTeamId).toBe(teamB)
    expect(state.current!.pointsAwarded).toBe(18)
    expect(state.roundsPlayed).toBe(1)
  })
})

describe('giveUp', () => {
  test('ninguém pontua e a rodada conta como jogada', () => {
    let state = drawCard(createMatch(['A', 'B'], POOL, CONFIG, seededRng()))
    state = giveUp(state)
    expect(state.teams.every((t) => t.score === 0)).toBe(true)
    expect(state.current!.resolved).toBe('gaveUp')
    expect(state.roundsPlayed).toBe(1)
  })
})

describe('fim de partida', () => {
  test('termina após totalRounds rodadas', () => {
    let state = createMatch(['A', 'B'], POOL, {
      ...CONFIG,
      totalRounds: 2,
    }, seededRng())
    state = giveUp(drawCard(state))
    expect(state.finished).toBe(false)
    state = giveUp(drawCard(state))
    expect(state.finished).toBe(true)
  })

  test('termina quando o baralho acaba, mesmo antes de totalRounds', () => {
    let state = createMatch(['A', 'B'], POOL, {
      themeChoice: 'esportes',
      difficulty: 'facil',
      totalRounds: 10,
    }, seededRng())
    state = giveUp(drawCard(state))
    state = giveUp(drawCard(state))
    expect(state.finished).toBe(true)
  })

  test('winners devolve o(s) time(s) com maior placar, incluindo empate', () => {
    let state = createMatch(['A', 'B'], POOL, CONFIG, seededRng())
    state = drawCard(state)
    state = correctGuess(state, state.teams[0].id)
    expect(winners(state).map((t) => t.name)).toEqual(['A'])

    const empatados = {
      ...state,
      teams: state.teams.map((t) => ({ ...t, score: 10 })),
    }
    expect(winners(empatados).map((t) => t.name)).toEqual(['A', 'B'])
  })
})

describe('availableThemes', () => {
  test('lista apenas temas que ainda têm cartas no baralho', () => {
    let state = createMatch(['A', 'B'], POOL, CONFIG, seededRng())
    expect(availableThemes(state).sort()).toEqual([
      'comida',
      'esportes',
      'lugares',
      'objetos',
      'pessoas',
    ])
    state = giveUp(drawCard(state, 'comida'))
    expect(availableThemes(state)).not.toContain('comida')
  })
})
