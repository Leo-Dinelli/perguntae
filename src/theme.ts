import type { Depth, Difficulty, ThemeChoice, ThemeId } from './game/types'

export interface ThemeMeta {
  label: string
  emoji: string
  color: string
  /** frase no topo da carta que direciona os participantes */
  direction: string
}

export const THEME_META: Record<ThemeId, ThemeMeta> = {
  esportes: {
    label: 'Esportes',
    emoji: '🏆',
    color: 'var(--color-tema-esportes)',
    direction: 'Sou um esporte, competição ou evento esportivo',
  },
  comida: {
    label: 'Comida',
    emoji: '🍴',
    color: 'var(--color-tema-comida)',
    direction: 'Sou uma comida, bebida ou ingrediente',
  },
  lugares: {
    label: 'Lugares',
    emoji: '🧭',
    color: 'var(--color-tema-lugares)',
    direction: 'Sou um lugar do Brasil ou do mundo',
  },
  objetos: {
    label: 'Objetos',
    emoji: '💡',
    color: 'var(--color-tema-objetos)',
    direction: 'Sou um objeto ou invenção',
  },
  pessoas: {
    label: 'Pessoas',
    emoji: '🎭',
    color: 'var(--color-tema-pessoas)',
    direction: 'Sou uma pessoa famosa, real ou fictícia',
  },
  filmes: {
    label: 'Filmes & Séries',
    emoji: '🎬',
    color: 'var(--color-tema-filmes)',
    direction: 'Sou um filme, série ou desenho famoso',
  },
  musica: {
    label: 'Música',
    emoji: '🎵',
    color: 'var(--color-tema-musica)',
    direction: 'Sou algo do mundo da música: artista, gênero, canção…',
  },
  animais: {
    label: 'Animais',
    emoji: '🐾',
    color: 'var(--color-tema-animais)',
    direction: 'Sou um animal (de verdade, prometo)',
  },
  marcas: {
    label: 'Marcas',
    emoji: '🏷️',
    color: 'var(--color-tema-marcas)',
    direction: 'Sou uma marca ou empresa famosa',
  },
  games: {
    label: 'Games & Brincadeiras',
    emoji: '🎮',
    color: 'var(--color-tema-games)',
    direction: 'Sou um jogo, videogame ou brincadeira',
  },
}

export const GERAL_META: ThemeMeta = {
  label: 'Conhecimentos Gerais',
  emoji: '🌍',
  color: 'var(--color-tema-geral)',
  direction: 'Pode ser qualquer tema — atenção à categoria da carta',
}

export const AMOR_META: ThemeMeta = {
  label: 'Relacionamento',
  emoji: '💞',
  color: 'var(--color-tema-amor)',
  direction: 'Sem certo ou errado: respondam um para o outro',
}

export function metaFor(choice: ThemeChoice): ThemeMeta {
  return choice === 'geral' ? GERAL_META : THEME_META[choice]
}

export const DIFFICULTY_META: Record<Difficulty, { label: string; hint: string }> = {
  facil: { label: 'Fácil', hint: '70% fáceis · 20% médias · 10% difíceis' },
  medio: { label: 'Médio', hint: '60% médias · 20% fáceis · 20% difíceis' },
  dificil: { label: 'Difícil', hint: '70% difíceis · 20% médias · 10% fáceis' },
}

export const DEPTH_META: Record<Depth, { label: string; emoji: string; hint: string }> = {
  leve: { label: 'Leve', emoji: '🍿', hint: 'quebra-gelo e risadas' },
  medio: { label: 'Média', emoji: '💛', hint: 'conexão e descobertas' },
  profundo: { label: 'Profunda', emoji: '🌊', hint: 'conversas de coração aberto' },
}
