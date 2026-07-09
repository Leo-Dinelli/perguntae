import type {
  AnswerCard,
  Difficulty,
  MatchConfig,
  MatchState,
  RoundState,
  Team,
  ThemeChoice,
  ThemeId,
} from './types'

export type Rng = () => number

const MAX_HINTS = 20

/** Acertou com menos dicas = mais pontos (1ª dica → 20 pts, 20ª → 1 pt) */
export function scoreForGuess(revealed: number): number {
  return Math.max(1, MAX_HINTS + 1 - revealed)
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Proporção de dificuldades no baralho para cada modo escolhido,
 * para a partida não ficar 100% monótona nem impossível.
 */
export const DIFFICULTY_MIX: Record<Difficulty, Record<Difficulty, number>> = {
  facil: { facil: 0.7, medio: 0.2, dificil: 0.1 },
  medio: { facil: 0.2, medio: 0.6, dificil: 0.2 },
  dificil: { facil: 0.1, medio: 0.2, dificil: 0.7 },
}

const DIFFICULTIES: Difficulty[] = ['facil', 'medio', 'dificil']

/**
 * Monta o baralho intercalando as dificuldades pelo peso do modo escolhido:
 * o início do baralho (as cartas que serão jogadas) segue a proporção do mix
 * e, se alguma dificuldade acabar, o restante preenche naturalmente.
 */
export function buildDeck(
  cards: AnswerCard[],
  themeChoice: ThemeChoice,
  difficulty: Difficulty,
  rng: Rng = Math.random,
): AnswerCard[] {
  const filtered = cards.filter(
    (c) => themeChoice === 'geral' || c.theme === themeChoice,
  )
  const buckets = new Map<Difficulty, AnswerCard[]>(
    DIFFICULTIES.map((d) => [
      d,
      shuffle(
        filtered.filter((c) => c.difficulty === d),
        rng,
      ),
    ]),
  )
  const weights = DIFFICULTY_MIX[difficulty]

  const deck: AnswerCard[] = []
  while (deck.length < filtered.length) {
    const nonEmpty = DIFFICULTIES.filter((d) => buckets.get(d)!.length > 0)
    const total = nonEmpty.reduce((sum, d) => sum + weights[d], 0)
    let pick = rng() * total
    let chosen = nonEmpty[nonEmpty.length - 1]
    for (const d of nonEmpty) {
      pick -= weights[d]
      if (pick <= 0) {
        chosen = d
        break
      }
    }
    deck.push(buckets.get(chosen)!.shift()!)
  }
  return deck
}

export function createMatch(
  teamNames: string[],
  cards: AnswerCard[],
  config: MatchConfig,
  rng: Rng = Math.random,
): MatchState {
  const teams: Team[] = teamNames.map((name, i) => ({
    id: `team-${i + 1}`,
    name,
    score: 0,
  }))
  return {
    config,
    teams,
    deck: buildDeck(cards, config.themeChoice, config.difficulty, rng),
    roundsPlayed: 0,
    current: null,
    finished: false,
  }
}

export function availableThemes(state: MatchState): ThemeId[] {
  return [...new Set(state.deck.map((c) => c.theme))]
}

export function drawCard(state: MatchState, theme?: ThemeId): MatchState {
  if (state.finished || (state.current && state.current.resolved === 'pending')) {
    return state
  }
  const index = theme
    ? state.deck.findIndex((c) => c.theme === theme)
    : state.deck.length > 0
      ? 0
      : -1
  if (index === -1) return { ...state, finished: true }

  const card = state.deck[index]
  const deck = state.deck.filter((_, i) => i !== index)
  return {
    ...state,
    deck,
    current: { card, revealed: 1, geniusUsed: false, resolved: 'pending' },
  }
}

export const GENIUS_HINT_COST = 5

/**
 * A dica genial mostra a dica mais reveladora da carta antes da hora,
 * em troca de 5 pontos do valor da rodada.
 */
export function buyGeniusHint(state: MatchState): MatchState {
  const round = state.current
  if (!round || round.resolved !== 'pending' || round.geniusUsed) return state
  return { ...state, current: { ...round, geniusUsed: true } }
}

/** Quanto a carta vale agora: dicas reveladas + custo da dica genial. */
export function roundValue(round: RoundState): number {
  const penalty = round.geniusUsed ? GENIUS_HINT_COST : 0
  return Math.max(1, scoreForGuess(round.revealed) - penalty)
}

export function revealHint(state: MatchState): MatchState {
  const round = state.current
  if (!round || round.resolved !== 'pending') return state
  return {
    ...state,
    current: {
      ...round,
      revealed: Math.min(MAX_HINTS, round.revealed + 1),
    },
  }
}

function finishRound(state: MatchState): Pick<MatchState, 'roundsPlayed' | 'finished'> {
  const roundsPlayed = state.roundsPlayed + 1
  return {
    roundsPlayed,
    finished: roundsPlayed >= state.config.totalRounds || state.deck.length === 0,
  }
}

export function correctGuess(state: MatchState, teamId: string): MatchState {
  const round = state.current
  if (!round || round.resolved !== 'pending') return state
  const points = roundValue(round)
  return {
    ...state,
    teams: state.teams.map((t) =>
      t.id === teamId ? { ...t, score: t.score + points } : t,
    ),
    current: {
      ...round,
      resolved: 'guessed',
      winnerTeamId: teamId,
      pointsAwarded: points,
    },
    ...finishRound(state),
  }
}

export function giveUp(state: MatchState): MatchState {
  const round = state.current
  if (!round || round.resolved !== 'pending') return state
  return {
    ...state,
    current: { ...round, resolved: 'gaveUp' },
    ...finishRound(state),
  }
}

/** Pula a carta atual: ela é descartada, sem pontos e sem contar rodada. */
export function skipCard(state: MatchState): MatchState {
  const round = state.current
  if (!round || round.resolved !== 'pending') return state
  return {
    ...state,
    current: null,
    finished: state.deck.length === 0,
  }
}

export function winners(state: MatchState): Team[] {
  const top = Math.max(...state.teams.map((t) => t.score))
  return state.teams.filter((t) => t.score === top)
}
