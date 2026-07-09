import { THEME_META } from '../theme'
import { THEMES } from '../game/types'

interface HomeProps {
  onGroupMode: () => void
  onCoupleMode: () => void
  onHistory: () => void
}

/** Emojis flutuando ao fundo, como cartas espalhadas na mesa. */
function FloatingBackground() {
  const pieces = [
    { emoji: '🏆', top: '6%', left: '8%', delay: '0s' },
    { emoji: '🎬', top: '12%', left: '82%', delay: '1.2s' },
    { emoji: '🍴', top: '38%', left: '4%', delay: '2.4s' },
    { emoji: '🎵', top: '46%', left: '90%', delay: '0.8s' },
    { emoji: '🐾', top: '68%', left: '10%', delay: '1.8s' },
    { emoji: '🎮', top: '76%', left: '84%', delay: '3s' },
    { emoji: '🧭', top: '90%', left: '20%', delay: '0.4s' },
    { emoji: '💡', top: '88%', left: '70%', delay: '2s' },
  ]
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.emoji}
          className="animate-float absolute text-4xl opacity-15 select-none"
          style={{ top: p.top, left: p.left, animationDelay: p.delay }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}

export function Home({ onGroupMode, onCoupleMode, onHistory }: HomeProps) {
  return (
    <div className="relative flex flex-col items-center gap-8 pt-10 pb-16">
      <FloatingBackground />

      <header className="animate-title-pop text-center">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-amber-200/80">
          Uma resposta · vinte pistas
        </p>
        <h1 className="font-display text-7xl text-amber-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.35)] sm:text-8xl">
          20 Dicas
        </h1>
        <p className="mt-3 max-w-md text-balance text-card/80">
          O jogo de adivinhação para jogar em grupo: quanto menos dicas você
          precisar, mais pontos você leva.
        </p>
      </header>

      <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
        <button
          onClick={onGroupMode}
          className="playing-card animate-rise group flex cursor-pointer flex-col items-start gap-3 p-6 text-left transition hover:-translate-y-1 hover:rotate-[-0.5deg] focus-visible:outline-4 focus-visible:outline-amber-300"
          style={{ animationDelay: '150ms' }}
        >
          <span className="flex gap-1.5 text-2xl">
            {THEMES.slice(0, 5).map((t) => (
              <span key={t}>{THEME_META[t].emoji}</span>
            ))}
          </span>
          <span className="font-display text-3xl">Partida em grupo</span>
          <span className="text-sm text-ink-soft">
            Times, placar, roleta de temas e cartas com 20 dicas. Agora com 10
            temas, de filmes a marcas.
          </span>
          <span className="btn-primary mt-2 w-full">Montar partida</span>
        </button>

        <button
          onClick={onCoupleMode}
          className="playing-card animate-rise group flex cursor-pointer flex-col items-start gap-3 p-6 text-left transition hover:-translate-y-1 hover:rotate-[0.5deg] focus-visible:outline-4 focus-visible:outline-amber-300"
          style={{ animationDelay: '250ms' }}
        >
          <span className="text-2xl">💞</span>
          <span className="font-display text-3xl">Modo casal</span>
          <span className="text-sm text-ink-soft">
            Sem certo ou errado: perguntas para se conhecer melhor, rir junto e
            ir fundo quando quiser.
          </span>
          <span
            className="btn mt-auto w-full text-white shadow-[0_4px_0_#a53a5c]"
            style={{ background: 'var(--color-tema-amor)' }}
          >
            Começar conversa
          </span>
        </button>
      </div>

      <button
        onClick={onHistory}
        className="btn-ghost animate-rise w-full max-w-lg text-sm"
        style={{ animationDelay: '350ms' }}
      >
        📜 Histórico de partidas
      </button>

      <details
        className="animate-rise w-full max-w-lg rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-sm text-card/85 open:pb-5"
        style={{ animationDelay: '420ms' }}
      >
        <summary className="cursor-pointer font-bold text-amber-200">
          Como se joga?
        </summary>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Monte os times e escolha tema, dificuldade e número de cartas.</li>
          <li>
            Uma carta é sorteada. O topo diz a categoria — pessoa, lugar, comida…
          </li>
          <li>
            Revelem as dicas uma a uma. Quem achar que sabe, grita a resposta!
          </li>
          <li>
            Acertou? O time leva os pontos da carta: começa valendo{' '}
            <strong>20</strong> e perde 1 ponto a cada dica revelada.
          </li>
          <li>Carta muito difícil? Dá para pular sem perder a rodada.</li>
          <li>No fim das cartas, vence o time com mais pontos.</li>
        </ol>
        <p className="mt-3">
          <strong>Dica de mesa:</strong> quem segura o aparelho é o narrador da
          rodada — ele pode espiar a resposta para validar os palpites.
        </p>
      </details>
    </div>
  )
}
