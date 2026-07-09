const COLORS = [
  'var(--color-tema-esportes)',
  'var(--color-tema-comida)',
  'var(--color-tema-lugares)',
  'var(--color-tema-objetos)',
  'var(--color-tema-pessoas)',
  'var(--color-tema-filmes)',
  'var(--color-tema-musica)',
  'var(--color-tema-amor)',
]

interface ConfettiProps {
  /** quantidade de papeizinhos (default 28) */
  count?: number
}

/** Chuva de confetes em CSS puro; some sozinha e respeita reduced-motion. */
export function Confetti({ count = 28 }: ConfettiProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${((i * 13) % 10) / 10}s`,
            animationDuration: `${2.4 + ((i * 7) % 14) / 10}s`,
            transform: `rotate(${(i * 47) % 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}
