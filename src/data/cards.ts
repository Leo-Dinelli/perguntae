import type { AnswerCard, RelationshipCard } from '../game/types'
import { comida } from './comida'
import { esportes } from './esportes'
import { lugares } from './lugares'
import { objetos } from './objetos'
import { pessoas } from './pessoas'
import { relacionamento } from './relacionamento'

export const ALL_CARDS: AnswerCard[] = [
  ...esportes,
  ...comida,
  ...lugares,
  ...objetos,
  ...pessoas,
]

export const RELATIONSHIP_CARDS: RelationshipCard[] = relacionamento
