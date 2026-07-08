import { useState } from 'react'
import { RELATIONSHIP_CARDS } from '../data/cards'
import type { Depth, RelationshipCard } from '../game/types'
import { AMOR_META, DEPTH_META } from '../theme'

interface CoupleProps {
  onExit: () => void
}

function shuffled(cards: RelationshipCard[]): RelationshipCard[] {
  const copy = [...cards]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function Couple({ onExit }: CoupleProps) {
  const [depth, setDepth] = useState<Depth | null>(null)
  const [deck, setDeck] = useState<RelationshipCard[]>([])
  const [index, setIndex] = useState(0)

  function choose(next: Depth) {
    setDepth(next)
    setDeck(shuffled(RELATIONSHIP_CARDS.filter((c) => c.depth === next)))
    setIndex(0)
  }

  function restart() {
    if (depth) setDeck(shuffled(RELATIONSHIP_CARDS.filter((c) => c.depth === depth)))
    setIndex(0)
  }

  // ── escolha de profundidade ──
  if (!depth) {
    return (
      <div className="flex flex-col gap-8 pb-16">
        <header className="flex items-center gap-3">
          <button onClick={onExit} className="btn-ghost px-4 py-2 text-sm" aria-label="Voltar">
            ←
          </button>
          <h1 className="font-display text-4xl text-amber-300">Modo casal</h1>
        </header>
        <p className="text-card/80">
          Aqui não tem pontos nem resposta certa: cada carta é uma pergunta para
          vocês dois. Respondam com calma, riam à vontade e escolham até onde
          querem ir.
        </p>
        <div className="flex flex-col gap-3">
          {(Object.keys(DEPTH_META) as Depth[]).map((d) => (
            <button
              key={d}
              onClick={() => choose(d)}
              className="playing-card flex cursor-pointer items-center gap-4 px-5 py-4 text-left transition hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-amber-300"
            >
              <span className="text-3xl">{DEPTH_META[d].emoji}</span>
              <span>
                <span className="block font-display text-2xl">
                  Conversa {DEPTH_META[d].label.toLowerCase()}
                </span>
                <span className="text-sm text-ink-soft">{DEPTH_META[d].hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const done = index >= deck.length
  const card = deck[index]

  return (
    <div className="flex flex-col gap-6 pb-16">
      <header className="flex items-center justify-between gap-3">
        <button onClick={() => setDepth(null)} className="btn-ghost px-4 py-2 text-sm">
          ← Profundidade
        </button>
        <span className="text-sm font-bold text-card/70">
          {DEPTH_META[depth].emoji} {Math.min(index + 1, deck.length)} de {deck.length}
        </span>
      </header>

      {done ? (
        <div className="playing-card animate-deal flex flex-col items-center gap-4 px-6 py-10 text-center">
          <span className="text-5xl">🥂</span>
          <p className="font-display text-3xl">As cartas acabaram!</p>
          <p className="text-ink-soft">
            Mas a conversa não precisa acabar. Que tal repetir — ou ir mais
            fundo?
          </p>
          <button onClick={restart} className="btn-primary w-full">
            🔁 Embaralhar de novo
          </button>
          <button onClick={() => setDepth(null)} className="btn bg-felt-700 w-full text-white shadow-[0_3px_0_#0d231c]">
            🌊 Mudar a profundidade
          </button>
        </div>
      ) : (
        <>
          <div key={card.id} className="playing-card animate-deal overflow-hidden">
            <div
              className="px-5 py-4 text-white"
              style={{ background: AMOR_META.color }}
            >
              <p className="font-display text-xl leading-tight">
                {AMOR_META.emoji} {AMOR_META.label}
                <span className="ml-2 rounded-full bg-black/25 px-2 py-0.5 align-middle text-xs font-bold">
                  {DEPTH_META[depth].label}
                </span>
              </p>
              <p className="text-sm text-white/85">{AMOR_META.direction}</p>
            </div>
            <p className="text-balance px-6 py-12 text-center text-2xl font-bold leading-snug">
              {card.prompt}
            </p>
          </div>
          <button onClick={() => setIndex((i) => i + 1)} className="btn-primary text-lg">
            💌 Próxima pergunta
          </button>
        </>
      )}
    </div>
  )
}
