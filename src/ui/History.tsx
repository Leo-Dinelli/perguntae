import { useState } from 'react'
import { clearHistory, loadHistory } from '../history'
import { DIFFICULTY_META, metaFor } from '../theme'

interface HistoryProps {
  onBack: () => void
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function History({ onBack }: HistoryProps) {
  const [records, setRecords] = useState(loadHistory)
  const [confirming, setConfirming] = useState(false)

  function handleClear() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    clearHistory()
    setRecords([])
    setConfirming(false)
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <header className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost px-4 py-2 text-sm" aria-label="Voltar">
          ←
        </button>
        <h1 className="font-display text-4xl text-amber-300">Histórico</h1>
      </header>

      <p className="-mt-3 text-xs text-card/60">
        🔒 Suas partidas ficam salvas apenas neste dispositivo e navegador —
        nada é enviado para nenhum servidor. Conversas do modo casal nunca são
        gravadas.
      </p>

      {records.length === 0 ? (
        <div className="playing-card animate-deal flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="text-5xl">🗒️</span>
          <p className="font-display text-2xl">Nenhuma partida ainda</p>
          <p className="text-ink-soft">
            Termine uma partida em grupo e o resultado aparece aqui.
          </p>
        </div>
      ) : (
        <>
          <ol className="flex flex-col gap-3">
            {records.map((record, i) => {
              const meta = metaFor(record.themeChoice)
              const ranking = [...record.teams].sort((a, b) => b.score - a.score)
              return (
                <li
                  key={record.id}
                  className="playing-card animate-rise overflow-hidden"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-card-edge px-4 py-2.5 text-xs font-bold text-ink-soft">
                    <span>{dateFormat.format(new Date(record.endedAt))}</span>
                    <span className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-white"
                        style={{ background: meta.color }}
                      >
                        {record.roulette ? '🎡 Roleta' : `${meta.emoji} ${meta.label}`}
                      </span>
                      <span className="rounded-full bg-black/10 px-2 py-0.5">
                        {DIFFICULTY_META[record.difficulty].label}
                      </span>
                      <span className="rounded-full bg-black/10 px-2 py-0.5">
                        {record.totalRounds} cartas
                      </span>
                    </span>
                  </div>
                  <ul className="divide-y divide-card-edge/60">
                    {ranking.map((team) => (
                      <li
                        key={team.name}
                        className="flex items-center gap-3 px-4 py-2"
                      >
                        <span className="flex-1 truncate font-bold">
                          {record.winners.includes(team.name) && '👑 '}
                          {team.name}
                        </span>
                        <span className="font-display text-xl">{team.score}</span>
                        <span className="text-[10px] font-bold uppercase text-ink-soft">
                          pts
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ol>
          <button onClick={handleClear} className="btn-ghost text-sm">
            {confirming ? '⚠️ Tem certeza? Toque de novo para apagar' : '🗑️ Limpar histórico'}
          </button>
        </>
      )}
    </div>
  )
}
