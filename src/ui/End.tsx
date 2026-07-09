import { useEffect, useRef } from 'react'
import { winners } from '../game/engine'
import type { MatchState } from '../game/types'
import { sfx } from '../sound'
import { Confetti } from './Confetti'

interface EndProps {
  match: MatchState
  onRematch: () => void
  onNewSetup: () => void
  onHome: () => void
}

export function End({ match, onRematch, onNewSetup, onHome }: EndProps) {
  const champs = winners(match)
  const ranking = [...match.teams].sort((a, b) => b.score - a.score)
  const tie = champs.length > 1
  const solo = match.teams.length === 1

  const playedFanfare = useRef(false)
  useEffect(() => {
    if (playedFanfare.current) return
    playedFanfare.current = true
    sfx.victory()
  }, [])

  return (
    <div className="relative flex flex-col items-center gap-8 pt-10 pb-16">
      <Confetti count={36} />
      <header className="animate-title-pop text-center">
        <span className="text-6xl">{solo ? '🎯' : tie ? '🤝' : '🏆'}</span>
        <h1 className="mt-3 font-display text-5xl text-amber-300">
          {solo
            ? `${match.teams[0].score} pontos!`
            : tie
              ? 'Empate!'
              : `${champs[0].name} venceu!`}
        </h1>
        <p className="mt-2 text-card/75">
          {solo
            ? 'Anote esse recorde — a próxima rodada é contra você mesmo.'
            : tie
              ? `${champs.map((t) => t.name).join(' e ')} terminaram lado a lado.`
              : 'Menos dicas, mais glória.'}
        </p>
      </header>

      <ol className="playing-card w-full max-w-md divide-y divide-card-edge">
        {ranking.map((team, i) => (
          <li key={team.id} className="flex items-center gap-4 px-5 py-4">
            <span className="font-display text-2xl text-ink-soft">{i + 1}º</span>
            <span className="flex-1 truncate font-bold">
              {champs.some((c) => c.id === team.id) && '👑 '}
              {team.name}
            </span>
            <span className="font-display text-3xl">{team.score}</span>
            <span className="text-xs font-bold uppercase text-ink-soft">pts</span>
          </li>
        ))}
      </ol>

      <div className="flex w-full max-w-md flex-col gap-3">
        <button onClick={onRematch} className="btn-primary text-lg">
          {solo ? '🔁 Jogar de novo' : '🔁 Revanche (mesmos times)'}
        </button>
        <button onClick={onNewSetup} className="btn-ghost">
          {solo ? '⚙️ Mudar tema ou dificuldade' : '⚙️ Mudar times ou tema'}
        </button>
        <button onClick={onHome} className="btn-ghost">
          🏠 Voltar ao início
        </button>
      </div>
    </div>
  )
}
