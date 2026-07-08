import { winners } from '../game/engine'
import type { MatchState } from '../game/types'

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

  return (
    <div className="flex flex-col items-center gap-8 pt-10 pb-16">
      <header className="text-center">
        <span className="text-6xl">{tie ? '🤝' : '🏆'}</span>
        <h1 className="mt-3 font-display text-5xl text-amber-300">
          {tie ? 'Empate!' : `${champs[0].name} venceu!`}
        </h1>
        <p className="mt-2 text-card/75">
          {tie
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
          🔁 Revanche (mesmos times)
        </button>
        <button onClick={onNewSetup} className="btn-ghost">
          ⚙️ Mudar times ou tema
        </button>
        <button onClick={onHome} className="btn-ghost">
          🏠 Voltar ao início
        </button>
      </div>
    </div>
  )
}
