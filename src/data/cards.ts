import type { AnswerCard, RelationshipCard } from '../game/types'
import { animais } from './animais'
import { comida } from './comida'
import { esportes } from './esportes'
import { filmes } from './filmes'
import { games } from './games'
import { lugares } from './lugares'
import { marcas } from './marcas'
import { musica } from './musica'
import { objetos } from './objetos'
import { pessoas } from './pessoas'
import { relacionamento } from './relacionamento'

/**
 * Packs gerados por scripts/generate-cards.mjs (JSON em ./packs/).
 * A qualidade é garantida pelos testes do banco, que cobrem tudo.
 */
const packModules = import.meta.glob('./packs/*.json', {
  eager: true,
  import: 'default',
})
const PACK_CARDS = Object.values(packModules).flat() as AnswerCard[]

export const ALL_CARDS: AnswerCard[] = [
  ...esportes,
  ...comida,
  ...lugares,
  ...objetos,
  ...pessoas,
  ...filmes,
  ...musica,
  ...animais,
  ...marcas,
  ...games,
  ...PACK_CARDS,
]

export const RELATIONSHIP_CARDS: RelationshipCard[] = relacionamento
