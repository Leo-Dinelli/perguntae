import type { Team } from '../game/types'

interface ScoreBarProps {
  teams: Team[]
  /** id do time que acabou de pontuar, para destaque */
  justScored?: string
}

export function ScoreBar({ teams, justScored }: ScoreBarProps) {
  const top = Math.max(...teams.map((t) => t.score))
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {teams.map((team) => {
        const isLeader = team.score === top && top > 0
        return (
          <div
            key={team.id}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold ${
              team.id === justScored
                ? 'animate-stamp border-amber-300 bg-amber-300 text-ink'
                : 'border-white/20 bg-white/10 text-card'
            }`}
          >
            {isLeader && <span aria-label="líder">👑</span>}
            <span className="max-w-28 truncate">{team.name}</span>
            <span className="font-display text-base leading-none">{team.score}</span>
          </div>
        )
      })}
    </div>
  )
}
