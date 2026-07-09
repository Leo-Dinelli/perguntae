#!/usr/bin/env node
/**
 * Gerador de lotes de cartas do PerguntAê (ferramenta de desenvolvimento).
 *
 * Usa a API da Anthropic para gerar cartas novas, valida cada uma com as
 * mesmas regras dos testes (20 dicas, nenhuma dica vaza a resposta, resposta
 * inédita) e grava um "pack" JSON em src/data/packs/ — que o app agrega
 * automaticamente. Depois de gerar, rode `npm test` para o gate final.
 *
 * Uso:
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-cards.mjs \
 *     --theme esportes --difficulty medio --count 30 [--model claude-opus-4-8]
 *
 * O app continua 100% estático: este script roda só em desenvolvimento.
 */
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = join(ROOT, 'src', 'data')
const PACKS_DIR = join(DATA_DIR, 'packs')

const THEMES = {
  esportes: 'esportes, competições, clubes e eventos esportivos',
  comida: 'comidas, bebidas e ingredientes',
  lugares: 'lugares do Brasil e do mundo (cidades, monumentos, natureza)',
  objetos: 'objetos e invenções',
  pessoas: 'pessoas famosas, reais ou fictícias',
  filmes: 'filmes, séries e desenhos famosos',
  musica: 'música: artistas, gêneros, canções e cultura musical',
  animais: 'animais reais',
  marcas: 'marcas e empresas famosas',
  games: 'jogos, videogames e brincadeiras',
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : fallback
}

const theme = arg('theme')
const difficulty = arg('difficulty', 'facil')
const count = Number(arg('count', '10'))
const model = arg('model', 'claude-opus-4-8')
const BATCH = 10 // cartas por chamada: mantém qualidade e evita truncar

if (!THEMES[theme] || !['facil', 'medio', 'dificil'].includes(difficulty)) {
  console.error('Uso: --theme <tema> --difficulty <facil|medio|dificil> --count <n>')
  console.error(`Temas: ${Object.keys(THEMES).join(', ')}`)
  process.exit(1)
}

/** Respostas já usadas no tema (arquivos TS escritos à mão + packs JSON) */
function existingAnswers() {
  const answers = new Set()
  for (const file of readdirSync(DATA_DIR)) {
    if (!file.endsWith('.ts')) continue
    const src = readFileSync(join(DATA_DIR, file), 'utf8')
    for (const m of src.matchAll(/answer:\s*(?:'([^']+)'|"([^"]+)")/g)) {
      answers.add((m[1] ?? m[2]).toLowerCase())
    }
  }
  for (const file of readdirSync(PACKS_DIR)) {
    if (!file.endsWith('.json')) continue
    const pack = JSON.parse(readFileSync(join(PACKS_DIR, file), 'utf8'))
    for (const card of pack) answers.add(card.answer.toLowerCase())
  }
  return answers
}

const CARD_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['cards'],
  properties: {
    cards: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['answer', 'hints'],
        properties: {
          answer: { type: 'string' },
          hints: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
}

function validate(card, answers) {
  const answer = card.answer?.trim()
  if (!answer) return 'resposta vazia'
  if (answers.has(answer.toLowerCase())) return `resposta repetida: ${answer}`
  if (!Array.isArray(card.hints) || card.hints.length !== 20) {
    return `${answer}: ${card.hints?.length ?? 0} dicas (precisa de 20)`
  }
  for (const hint of card.hints) {
    if (!hint?.trim()) return `${answer}: dica vazia`
    if (hint.toLowerCase().includes(answer.toLowerCase())) {
      return `${answer}: dica vaza a resposta ("${hint}")`
    }
  }
  return null
}

async function generateBatch(client, n, answers) {
  const prompt = `Gere ${n} cartas para o jogo de adivinhação brasileiro "PerguntAê" (estilo Perfil).

TEMA: ${THEMES[theme]}
DIFICULDADE: ${difficulty} (facil = todo brasileiro conhece; medio = exige repertório; dificil = para quem gosta de sofrer, mas ainda justo)

REGRAS INEGOCIÁVEIS por carta:
- "answer": a resposta em português (título/nome próprio como usado no Brasil).
- "hints": EXATAMENTE 20 dicas, ordenadas da mais difícil/obscura para a mais fácil/entregue.
- Dicas em primeira pessoa, estilo "Sou...", "Fui...", "Meu...".
- Cada dica é FACTUALMENTE VERDADEIRA e verificável. Nada inventado.
- NENHUMA dica pode conter a resposta (nem como parte de outra palavra).
- Humor: seja divertido dentro do contexto, especialmente nas dicas finais
  (piadas leves, ironias, referências à cultura brasileira). Sem forçar.
- NÃO use nenhuma destas respostas já existentes: ${[...answers].join('; ')}

Responda apenas com o JSON.`

  const stream = client.messages.stream({
    model,
    max_tokens: 64000,
    thinking: { type: 'adaptive' },
    output_config: { format: { type: 'json_schema', schema: CARD_SCHEMA } },
    messages: [{ role: 'user', content: prompt }],
  })
  const message = await stream.finalMessage()
  if (message.stop_reason === 'refusal') {
    throw new Error('Pedido recusado pela API — tente novamente')
  }
  const text = message.content.find((b) => b.type === 'text')?.text ?? '{}'
  return JSON.parse(text).cards ?? []
}

const client = new Anthropic()
const answers = existingAnswers()
const accepted = []
const rejected = []

while (accepted.length < count) {
  const need = Math.min(BATCH, count - accepted.length)
  console.log(`Gerando lote de ${need} cartas (${accepted.length}/${count})...`)
  const cards = await generateBatch(client, need, answers)
  for (const card of cards) {
    const error = validate(card, answers)
    if (error) {
      rejected.push(error)
      continue
    }
    answers.add(card.answer.toLowerCase())
    accepted.push({
      id: `${theme}-gen-${Date.now()}-${accepted.length}`,
      theme,
      difficulty,
      answer: card.answer.trim(),
      hints: card.hints.map((h) => h.trim()),
    })
  }
}

const outFile = join(PACKS_DIR, `${theme}-${difficulty}-${Date.now()}.json`)
writeFileSync(outFile, JSON.stringify(accepted, null, 2))
console.log(`\n✅ ${accepted.length} cartas gravadas em ${outFile}`)
if (rejected.length > 0) {
  console.log(`⚠️  ${rejected.length} cartas rejeitadas na validação:`)
  for (const r of rejected) console.log(`   - ${r}`)
}
console.log('\nAgora rode: npm test  (gate final de qualidade)')
