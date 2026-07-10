import { useEffect, useRef, useState } from 'react'
import {
  availableThemes,
  correctGuess,
  drawCard,
  GENIUS_HINT_COST,
  giveUp,
  revealHint,
  roundValue,
  skipCard,
  buyGeniusHint,
} from '../game/engine'
import { evaluateGuess, type GuessLevel } from '../game/guess'
import type { MatchState, ThemeId } from '../game/types'
import { sfx } from '../sound'
import { DIFFICULTY_META, THEME_META } from '../theme'
import { Confetti } from './Confetti'
import { ScoreBar } from './ScoreBar'
import { Wheel } from './Wheel'

interface PlayProps {
  match: MatchState
  roulette: boolean
  onChange: (next: MatchState) => void
  onFinish: () => void
  onQuit: () => void
}

const FEEDBACK: Record<Exclude<GuessLevel, 'acertou'>, string> = {
  longe: '❄️ Longe… tenta outra!',
  chegando: '🌡️ Chegando lá…',
  perto: '🔥 Perto da resposta!',
}

export function Play({ match, roulette, onChange, onFinish, onQuit }: PlayProps) {
  const [betweenRounds, setBetweenRounds] = useState(true)
  const [dealing, setDealing] = useState(false)
  const [peek, setPeek] = useState(false)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<Exclude<GuessLevel, 'acertou'> | null>(null)
  const [attempts, setAttempts] = useState(0)
  const hintsEndRef = useRef<HTMLLIElement>(null)
  const dealTimer = useRef<number | null>(null)

  const solo = match.teams.length === 1
  const round = match.current
  const roundActive = round?.resolved === 'pending'
  // !dealing: ao sacar a próxima carta, a rodada anterior (já resolvida) não
  // pode reaparecer durante a janela do embaralhar
  const showResult = round != null && round.resolved !== 'pending' && !betweenRounds && !dealing

  useEffect(() => {
    hintsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [round?.revealed])

  useEffect(
    () => () => {
      if (dealTimer.current != null) window.clearTimeout(dealTimer.current)
    },
    [],
  )

  function draw(theme?: ThemeId) {
    if (dealing) return
    setPeek(false)
    setGuess('')
    setFeedback(null)
    setAttempts(0)
    setBetweenRounds(false)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // roleta: o giro já criou o suspense — a carta sai direto
    if (theme !== undefined || reduced) {
      sfx.draw()
      onChange(drawCard(match, theme))
      return
    }

    // baralho: embaralha (1,15s, casado com a animação CSS), depois saca
    setDealing(true)
    sfx.shuffle()
    dealTimer.current = window.setTimeout(() => {
      setDealing(false)
      sfx.draw()
      onChange(drawCard(match))
    }, 1150)
  }

  function submitGuess() {
    if (!round || !guess.trim()) return
    const level = evaluateGuess(guess, round.card.answer)
    if (level === 'acertou') {
      sfx.correct()
      onChange(correctGuess(match, match.teams[0].id))
      return
    }
    setFeedback(level)
    setAttempts((n) => n + 1)
    if (level === 'longe') sfx.cold()
    else sfx.warm()
  }

  function advance() {
    if (match.finished) {
      onFinish()
    } else {
      setBetweenRounds(true)
    }
  }

  const cardNumber = roundActive ? match.roundsPlayed + 1 : match.roundsPlayed
  // com a dica genial ativa, a dica 20 já está visível no destaque
  const maxReveal = round?.geniusUsed ? 19 : 20

  return (
    <div className="flex flex-col gap-5 pb-16">
      <header className="flex items-center justify-between gap-3">
        <button onClick={onQuit} className="btn-ghost px-4 py-2 text-sm">
          ← Sair
        </button>
        <span className="text-sm font-bold text-card/70">
          Carta {Math.max(cardNumber, 1)} de {match.config.totalRounds}
        </span>
      </header>

      <ScoreBar teams={match.teams} justScored={showResult ? round?.winnerTeamId : undefined} />

      {/* ── entre rodadas: sacar carta ou girar roleta ── */}
      {!roundActive && !showResult && (
        <div className="flex flex-col items-center gap-6 pt-6">
          {roulette ? (
            <>
              <p className="text-center font-display text-2xl text-amber-200">
                Girem a roleta para sortear o tema!
              </p>
              <Wheel themes={availableThemes(match)} onResult={(t) => draw(t)} />
            </>
          ) : dealing ? (
            <>
              {/* baralho embaralhando: as cartas dançam e a de cima sobe */}
              <div className="relative mt-4 h-48 w-72">
                <div className="shuffle-a playing-card absolute left-0 top-3 h-44 w-72 opacity-70" />
                <div className="shuffle-b playing-card absolute left-0 top-1.5 h-44 w-72 opacity-85" />
                <div className="shuffle-c playing-card absolute left-0 top-0 flex h-44 w-72 items-center justify-center">
                  <span className="font-display text-5xl text-card-edge">20</span>
                </div>
              </div>
              <p className="animate-pulse font-display text-xl text-amber-200">
                Embaralhando…
              </p>
            </>
          ) : (
            <>
              {/* verso do baralho */}
              <div className="relative mt-4">
                <div className="playing-card absolute -left-2 top-2 h-44 w-72 rotate-[-4deg] opacity-60" />
                <div className="playing-card absolute -right-2 top-1 h-44 w-72 rotate-[3deg] opacity-80" />
                <div className="playing-card relative flex h-44 w-72 items-center justify-center">
                  <span className="font-display text-5xl text-card-edge">20</span>
                </div>
              </div>
              <button onClick={() => draw()} className="btn-primary text-lg">
                🎴 Sacar carta
              </button>
            </>
          )}
        </div>
      )}

      {/* ── carta em jogo ── */}
      {roundActive && round && (
        <div className="playing-card animate-draw-in overflow-hidden">
          <div
            className="flex items-center justify-between gap-3 px-5 py-4 text-white"
            style={{ background: THEME_META[round.card.theme].color }}
          >
            <div>
              <p className="font-display text-xl leading-tight">
                {THEME_META[round.card.theme].emoji} {THEME_META[round.card.theme].label}
                <span className="ml-2 rounded-full bg-black/25 px-2 py-0.5 align-middle text-xs font-bold">
                  {DIFFICULTY_META[round.card.difficulty].label}
                </span>
              </p>
              <p className="text-sm text-white/85">
                {THEME_META[round.card.theme].direction}
              </p>
            </div>
            {!solo && (
              <button
                onClick={() => setPeek((p) => !p)}
                className="shrink-0 cursor-pointer rounded-xl bg-black/25 px-3 py-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-white"
                aria-pressed={peek}
                title="Só para o narrador da rodada!"
              >
                {peek ? `🙈 ${round.card.answer}` : '👁 Espiar resposta'}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-card-edge px-5 py-3">
            <p className="text-sm font-bold text-ink-soft">
              Dica {round.revealed} de {round.card.hints.length}
            </p>
            <p className="flex items-center gap-2" aria-live="polite">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                valendo
              </span>
              <span
                key={`${round.revealed}-${round.geniusUsed}`}
                className="animate-stamp inline-flex h-11 w-11 items-center justify-center rounded-full font-display text-2xl text-white shadow"
                style={{ background: THEME_META[round.card.theme].color }}
              >
                {roundValue(round)}
              </span>
              <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                pts
              </span>
            </p>
          </div>

          <ol className="max-h-72 space-y-2.5 overflow-y-auto px-5 py-4">
            {round.card.hints.slice(0, round.revealed).map((hint, i) => (
              <li
                key={i}
                ref={i === round.revealed - 1 ? hintsEndRef : undefined}
                className={`flex gap-3 ${i === round.revealed - 1 ? 'animate-hint font-bold' : 'text-ink/75'}`}
              >
                <span
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: THEME_META[round.card.theme].color }}
                >
                  {i + 1}
                </span>
                {hint}
              </li>
            ))}
          </ol>

          {round.geniusUsed && (
            <div
              className="animate-hint mx-5 mb-3 rounded-2xl border-2 bg-amber-50 px-4 py-3"
              style={{ borderColor: THEME_META[round.card.theme].color }}
            >
              <p
                className="mb-1 text-xs font-bold uppercase tracking-wide"
                style={{ color: THEME_META[round.card.theme].color }}
              >
                🧠 Dica genial (valeu −{GENIUS_HINT_COST} pts)
              </p>
              <p className="font-bold">{round.card.hints[19]}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-card-edge bg-black/[0.03] px-5 py-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sfx.reveal()
                  onChange(revealHint(match))
                }}
                disabled={round.revealed >= maxReveal}
                className="btn-primary flex-1"
              >
                💡 Revelar próxima dica
              </button>
              <button
                onClick={() => {
                  sfx.genius()
                  onChange(buyGeniusHint(match))
                }}
                disabled={round.geniusUsed || round.revealed >= 20}
                className="btn border-2 border-amber-400 bg-amber-100 text-sm text-ink"
                title={`Mostra a dica mais reveladora da carta em troca de ${GENIUS_HINT_COST} pontos`}
              >
                🧠 Dica genial (−{GENIUS_HINT_COST})
              </button>
            </div>

            {solo ? (
              <div>
                <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-ink-soft">
                  E aí, sabe a resposta?
                </p>
                <div className="flex gap-2">
                  <input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitGuess()
                    }}
                    placeholder="Digite sua resposta…"
                    aria-label="Sua resposta"
                    autoComplete="off"
                    autoCorrect="off"
                    className="w-full rounded-2xl border-2 border-ink/15 bg-white px-4 py-3 font-bold text-ink outline-none transition focus:border-amber-400"
                  />
                  <button
                    onClick={submitGuess}
                    disabled={!guess.trim()}
                    className="btn bg-felt-700 px-5 text-sm text-white shadow-[0_3px_0_#0d231c]"
                  >
                    Responder
                  </button>
                </div>
                {feedback && (
                  <p
                    key={attempts}
                    className="animate-stamp mt-2 text-center font-bold text-ink-soft"
                    aria-live="polite"
                  >
                    {FEEDBACK[feedback]}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-ink-soft">
                  Alguém acertou? Toque no time
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {match.teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => {
                        sfx.correct()
                        onChange(correctGuess(match, team.id))
                      }}
                      className="btn bg-felt-700 px-4 py-2.5 text-sm text-white shadow-[0_3px_0_#0d231c]"
                    >
                      ✅ {team.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPeek(false)
                  sfx.skip()
                  onChange(skipCard(match))
                }}
                className="btn flex-1 border border-ink/15 bg-black/5 text-sm text-ink-soft"
                title="Descarta esta carta sem pontuar; ela não conta como rodada"
              >
                ⏭️ Pular carta
              </button>
              <button
                onClick={() => {
                  sfx.wrong()
                  onChange(giveUp(match))
                }}
                className="btn flex-1 border border-ink/15 bg-black/5 text-sm text-ink-soft"
              >
                {solo ? '🏳️ Não sei, revela!' : '🏳️ Ninguém acertou'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── resultado da rodada ── */}
      {showResult && round && (
        <div className="playing-card animate-deal relative flex flex-col items-center gap-4 overflow-hidden px-6 py-8 text-center">
          {round.resolved === 'guessed' && <Confetti count={18} />}
          {round.resolved === 'guessed' ? (
            <>
              <span className="animate-stamp text-5xl">🎉</span>
              <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">
                {solo
                  ? `Você acertou com ${round.revealed} ${round.revealed === 1 ? 'dica' : 'dicas'}!`
                  : `${match.teams.find((t) => t.id === round.winnerTeamId)?.name} acertou com ${round.revealed} ${round.revealed === 1 ? 'dica' : 'dicas'}!`}
              </p>
            </>
          ) : (
            <>
              <span className="animate-stamp text-5xl">😅</span>
              <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">
                {solo ? 'A resposta era…' : 'Ninguém acertou! A resposta era…'}
              </p>
            </>
          )}
          <p className="font-display text-4xl" style={{ color: THEME_META[round.card.theme].color }}>
            {round.card.answer}
          </p>
          {round.resolved === 'guessed' && (
            <p className="rounded-full bg-amber-300 px-4 py-1.5 font-display text-xl text-ink">
              +{round.pointsAwarded} pontos
            </p>
          )}
          <button onClick={advance} className="btn-primary mt-2 w-full text-lg">
            {match.finished ? '🏆 Ver resultado final' : '🎴 Próxima carta'}
          </button>
        </div>
      )}
    </div>
  )
}
