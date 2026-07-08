import type {
  AnswerCard,
  Difficulty,
  MatchConfig,
  MatchState,
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

export function buildDeck(
  cards: AnswerCard[],
  themeChoice: ThemeChoice,
  difficulty: Difficulty,
  rng: Rng = Math.random,
): AnswerCard[] {
  const filtered = cards.filter(
    (c) =>
      c.difficulty === difficulty &&
      (themeChoice === 'geral' || c.theme === themeChoice),
  )
  return shuffle(filtered, rng)
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
    current: { card, revealed: 1, resolved: 'pending' },
  }
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
  const points = scoreForGuess(round.revealed)
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

export function winners(state: MatchState): Team[] {
  const top = Math.max(...state.teams.map((t) => t.score))
  return state.teams.filter((t) => t.score === top)
}
