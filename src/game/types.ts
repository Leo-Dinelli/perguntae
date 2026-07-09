export const THEMES = [
  'esportes',
  'comida',
  'lugares',
  'objetos',
  'pessoas',
  'filmes',
  'musica',
  'animais',
  'marcas',
  'games',
] as const

export type ThemeId = (typeof THEMES)[number]

/** 'geral' = conhecimentos gerais (todos os temas misturados) */
export type ThemeChoice = ThemeId | 'geral'

export type Difficulty = 'facil' | 'medio' | 'dificil'

/** Nível de profundidade do modo Relacionamento */
export type Depth = 'leve' | 'medio' | 'profundo'

export interface AnswerCard {
  id: string
  theme: ThemeId
  difficulty: Difficulty
  answer: string
  /** Sempre 20 dicas, da mais difícil para a mais fácil */
  hints: string[]
}

export interface RelationshipCard {
  id: string
  depth: Depth
  prompt: string
  /** Exemplo bem-humorado opcional para destravar a resposta */
  example?: string
}

export interface Team {
  id: string
  name: string
  score: number
}

export interface MatchConfig {
  themeChoice: ThemeChoice
  difficulty: Difficulty
  totalRounds: number
}

export interface RoundState {
  card: AnswerCard
  /** Quantas dicas já foram reveladas (mínimo 1 após sacar a carta) */
  revealed: number
  /** Dica genial usada nesta carta (custa 5 pontos do valor) */
  geniusUsed: boolean
  resolved: 'pending' | 'guessed' | 'gaveUp'
  winnerTeamId?: string
  pointsAwarded?: number
}

export interface MatchState {
  config: MatchConfig
  teams: Team[]
  /** Cartas ainda não jogadas, já embaralhadas */
  deck: AnswerCard[]
  /** Rodadas concluídas */
  roundsPlayed: number
  current: RoundState | null
  finished: boolean
}
