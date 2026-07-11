import { useEffect, useRef } from 'react'

interface RulesModalProps {
  mode: 'grupo' | 'solo'
  onPlay: () => void
  onClose: () => void
}

const RULES: Record<
  'grupo' | 'solo',
  { emoji: string; title: string; intro: string; items: { icon: string; text: string }[] }
> = {
  grupo: {
    emoji: '🎲',
    title: 'Como jogar em grupo',
    intro: 'Times disputam quem adivinha a resposta secreta com menos dicas.',
    items: [
      {
        icon: '🃏',
        text: 'Cada carta tem uma resposta secreta e 20 dicas, da mais difícil à mais fácil.',
      },
      {
        icon: '🗣️',
        text: 'Um jogador é o narrador da rodada: só ele espia a resposta e lê as dicas em voz alta, uma por vez.',
      },
      {
        icon: '⚡',
        text: 'Os times dão palpites a qualquer momento. Alguém acertou? Toque no nome do time!',
      },
      {
        icon: '💎',
        text: 'Acertar na 1ª dica vale 20 pontos; cada dica a mais tira 1 ponto (na 20ª vale 1).',
      },
      {
        icon: '🧠',
        text: 'Dica genial: revela a dica mais fácil na hora, mas custa 5 pontos da rodada.',
      },
      {
        icon: '⏭️',
        text: 'Pular carta descarta sem pontuar. Se ninguém acertar, revele e siga o jogo.',
      },
      {
        icon: '🏆',
        text: 'Ao fim das cartas, vence o time com mais pontos!',
      },
    ],
  },
  solo: {
    emoji: '🎯',
    title: 'Como jogar sozinho',
    intro: 'Você contra o baralho: adivinhe com o mínimo de dicas e bata seu recorde.',
    items: [
      {
        icon: '🃏',
        text: 'Cada carta tem uma resposta secreta e 20 dicas, da mais difícil à mais fácil.',
      },
      {
        icon: '💡',
        text: 'Revele dicas no seu ritmo e digite o palpite quando quiser — sem se preocupar com acento ou maiúscula.',
      },
      {
        icon: '🌡️',
        text: 'O jogo responde na hora: ❄️ longe, 🌡️ chegando, 🔥 perto… ou 🎉 acertou!',
      },
      {
        icon: '💎',
        text: 'Acertar na 1ª dica vale 20 pontos; cada dica a mais tira 1 ponto (na 20ª vale 1).',
      },
      {
        icon: '🧠',
        text: 'Dica genial: revela a dica mais fácil na hora, mas custa 5 pontos da rodada.',
      },
      {
        icon: '🏳️',
        text: 'Travou? "Não sei, revela!" mostra a resposta e vem carta nova.',
      },
      {
        icon: '🏅',
        text: 'Feche a partida com a maior pontuação que conseguir — e depois supere!',
      },
    ],
  },
}

/** Resumo de regras exibido ao escolher um modo de jogo na tela inicial. */
export function RulesModal({ mode, onPlay, onClose }: RulesModalProps) {
  const rules = RULES[mode]
  const playRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    playRef.current?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        className="playing-card animate-deal flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-card-edge px-5 py-4">
          <h2 id="rules-title" className="font-display text-2xl">
            {rules.emoji} {rules.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black/5 text-lg font-bold text-ink-soft transition active:scale-90"
          >
            ✕
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-4">
          <p className="mb-4 font-bold text-ink-soft">{rules.intro}</p>
          <ul className="space-y-3">
            {rules.items.map((item) => (
              <li key={item.icon} className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-lg" aria-hidden>
                  {item.icon}
                </span>
                <span className="text-[15px] leading-snug">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-card-edge bg-black/[0.03] px-5 py-4">
          <button ref={playRef} onClick={onPlay} className="btn-primary w-full text-lg">
            Entendi, bora jogar!
          </button>
        </div>
      </div>
    </div>
  )
}
