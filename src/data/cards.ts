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
]

export const RELATIONSHIP_CARDS: RelationshipCard[] = relacionamento
