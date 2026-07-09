/** Quão perto o palpite chegou da resposta (modo solo). */
export type GuessLevel = 'acertou' | 'perto' | 'chegando' | 'longe'

const ARTICLES = new Set(['o', 'a', 'os', 'as', 'um', 'uma', 'the'])

/** minúsculas, sem acentos, sem pontuação, espaços normalizados */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** remove artigo inicial ("o rei leão" → "rei leão") */
function stripArticle(text: string): string {
  const tokens = text.split(' ')
  return tokens.length > 1 && ARTICLES.has(tokens[0])
    ? tokens.slice(1).join(' ')
    : text
}

function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const next = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      diagonal = prev[j]
      prev[j] = next
    }
  }
  return prev[b.length]
}

function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length)
  return max === 0 ? 0 : 1 - levenshtein(a, b) / max
}

export function evaluateGuess(guess: string, answer: string): GuessLevel {
  const g = normalize(guess)
  const a = normalize(answer)
  if (!g || !a) return 'longe'

  const gStripped = stripArticle(g)
  const aStripped = stripArticle(a)
  if (g === a || gStripped === aStripped) return 'acertou'

  const score = Math.max(similarity(g, a), similarity(gStripped, aStripped))
  if (score >= 0.85) return 'acertou'

  // uma palavra só e ela existe na resposta: quase lá
  const answerTokens = new Set(aStripped.split(' '))
  if (!gStripped.includes(' ') && gStripped.length >= 3 && answerTokens.has(gStripped)) {
    return 'perto'
  }

  if (score >= 0.55) return 'perto'
  if (score >= 0.3) return 'chegando'
  return 'longe'
}
