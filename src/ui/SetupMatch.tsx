import { useState } from 'react'
import type { Difficulty, MatchConfig, ThemeChoice } from '../game/types'
import { THEMES } from '../game/types'
import { DIFFICULTY_META, GERAL_META, THEME_META } from '../theme'

export interface MatchSetup {
  teamNames: string[]
  config: MatchConfig
  roulette: boolean
}

interface SetupMatchProps {
  onStart: (setup: MatchSetup) => void
  onBack: () => void
}

type ThemePick = ThemeChoice | 'roleta'

const ROUND_OPTIONS = [5, 10, 15]
const MAX_TEAMS = 6

export function SetupMatch({ onStart, onBack }: SetupMatchProps) {
  const [teamNames, setTeamNames] = useState<string[]>(['Time Azul', 'Time Vermelho'])
  const [themePick, setThemePick] = useState<ThemePick>('geral')
  const [difficulty, setDifficulty] = useState<Difficulty>('facil')
  const [totalRounds, setTotalRounds] = useState(10)

  function updateTeam(index: number, name: string) {
    setTeamNames((names) => names.map((n, i) => (i === index ? name : n)))
  }

  function removeTeam(index: number) {
    setTeamNames((names) => names.filter((_, i) => i !== index))
  }

  function addTeam() {
    setTeamNames((names) => [...names, `Time ${names.length + 1}`])
  }

  function start() {
    const cleaned = teamNames.map((n, i) => n.trim() || `Time ${i + 1}`)
    onStart({
      teamNames: cleaned,
      config: {
        themeChoice: themePick === 'roleta' ? 'geral' : themePick,
        difficulty,
        totalRounds,
      },
      roulette: themePick === 'roleta',
    })
  }

  const pickChip = (active: boolean) =>
    `flex items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition cursor-pointer focus-visible:outline-4 focus-visible:outline-amber-300 ${
      active
        ? 'border-amber-300 bg-amber-300/15 text-amber-100'
        : 'border-white/15 bg-white/5 text-card/85 hover:border-white/35'
    }`

  return (
    <div className="flex flex-col gap-8 pb-16">
      <header className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost px-4 py-2 text-sm" aria-label="Voltar">
          ←
        </button>
        <h1 className="font-display text-4xl text-amber-300">Montar partida</h1>
      </header>

      <section aria-labelledby="times">
        <h2 id="times" className="mb-3 font-display text-2xl text-card">
          Times
        </h2>
        <div className="flex flex-col gap-2">
          {teamNames.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={name}
                onChange={(e) => updateTeam(i, e.target.value)}
                maxLength={20}
                aria-label={`Nome do time ${i + 1}`}
                className="w-full rounded-2xl border-2 border-white/15 bg-white/5 px-4 py-3 font-bold text-card outline-none transition focus:border-amber-300"
              />
              {teamNames.length > 2 && (
                <button
                  onClick={() => removeTeam(i)}
                  className="btn-ghost px-4"
                  aria-label={`Remover time ${i + 1}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {teamNames.length < MAX_TEAMS && (
          <button onClick={addTeam} className="btn-ghost mt-2 w-full text-sm">
            + Adicionar time
          </button>
        )}
      </section>

      <section aria-labelledby="tema">
        <h2 id="tema" className="mb-3 font-display text-2xl text-card">
          Tema
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button className={pickChip(themePick === 'geral')} onClick={() => setThemePick('geral')}>
            <span className="text-xl">{GERAL_META.emoji}</span> Conhecimentos gerais
          </button>
          <button className={pickChip(themePick === 'roleta')} onClick={() => setThemePick('roleta')}>
            <span className="text-xl">🎡</span> Roleta de temas
          </button>
          {THEMES.map((t) => (
            <button key={t} className={pickChip(themePick === t)} onClick={() => setThemePick(t)}>
              <span className="text-xl">{THEME_META[t].emoji}</span> {THEME_META[t].label}
            </button>
          ))}
        </div>
        {themePick === 'roleta' && (
          <p className="mt-2 text-sm text-card/70">
            A cada carta, a roleta sorteia um tema na hora. 🎉
          </p>
        )}
      </section>

      <section aria-labelledby="dificuldade">
        <h2 id="dificuldade" className="mb-3 font-display text-2xl text-card">
          Dificuldade
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((d) => (
            <button key={d} className={pickChip(difficulty === d)} onClick={() => setDifficulty(d)}>
              <span>
                {DIFFICULTY_META[d].label}
                <span className="mt-0.5 block text-xs font-normal opacity-70">
                  {DIFFICULTY_META[d].hint}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="cartas">
        <h2 id="cartas" className="mb-3 font-display text-2xl text-card">
          Cartas na partida
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {ROUND_OPTIONS.map((n) => (
            <button key={n} className={pickChip(totalRounds === n)} onClick={() => setTotalRounds(n)}>
              <span className="w-full text-center">{n} cartas</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-card/60">
          Se as cartas do tema acabarem antes, a partida termina no que der — sem
          carta repetida, nunca.
        </p>
      </section>

      <button onClick={start} className="btn-primary text-lg">
        🎴 Começar partida
      </button>
    </div>
  )
}
