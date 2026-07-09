import type { Difficulty, ThemeChoice } from './game/types'

export interface MatchRecord {
  id: string
  /** ISO 8601 */
  endedAt: string
  themeChoice: ThemeChoice
  roulette: boolean
  difficulty: Difficulty
  totalRounds: number
  teams: { name: string; score: number }[]
  winners: string[]
}

const KEY = 'vinte-dicas:history:v1'
const MAX_RECORDS = 50

function isRecord(value: unknown): value is MatchRecord {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.endedAt === 'string' &&
    typeof r.difficulty === 'string' &&
    Array.isArray(r.teams) &&
    r.teams.every(
      (t: unknown) =>
        typeof t === 'object' &&
        t !== null &&
        typeof (t as Record<string, unknown>).name === 'string' &&
        typeof (t as Record<string, unknown>).score === 'number',
    ) &&
    Array.isArray(r.winners)
  )
}

export function loadHistory(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isRecord)
  } catch {
    return []
  }
}

export function saveMatch(record: MatchRecord): void {
  try {
    const history = loadHistory()
    if (history.some((r) => r.id === record.id)) return
    localStorage.setItem(
      KEY,
      JSON.stringify([record, ...history].slice(0, MAX_RECORDS)),
    )
  } catch {
    // storage cheio ou indisponível: histórico é conveniência, não crítico
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // idem
  }
}
