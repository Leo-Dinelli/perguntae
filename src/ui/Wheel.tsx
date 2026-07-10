import { useRef, useState } from 'react'
import type { ThemeId } from '../game/types'
import { sfx } from '../sound'
import { THEME_META } from '../theme'

interface WheelProps {
  themes: ThemeId[]
  onResult: (theme: ThemeId) => void
}

/** Roleta de temas: gira e sorteia um tema entre os que ainda têm cartas. */
export function Wheel({ themes, onResult }: WheelProps) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const target = useRef<ThemeId | null>(null)

  const seg = 360 / themes.length
  const gradient = `conic-gradient(${themes
    .map((t, i) => `${THEME_META[t].color} ${i * seg}deg ${(i + 1) * seg}deg`)
    .join(', ')})`

  function spin() {
    if (spinning || themes.length === 0) return
    const index = Math.floor(Math.random() * themes.length)
    target.current = themes[index]
    const center = index * seg + seg / 2
    const finalMod = (360 - center) % 360
    const currentMod = ((rotation % 360) + 360) % 360
    const delta = ((finalMod - currentMod + 360) % 360) + 5 * 360

    // som sincronizado com o giro: a transição CSS usa easeOutCubic
    // (cubic-bezier(0.33, 1, 0.68, 1)); invertendo o easing, achamos o
    // instante exato em que cada fronteira de segmento cruza o ponteiro
    // e tocamos um "clack" ali — como uma roleta de verdade.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const durationMs = reduced ? 300 : 3200 // igual ao CSS .wheel-disc
    const ticks: number[] = []
    for (let angle = Math.ceil(rotation / seg) * seg; angle <= rotation + delta; angle += seg) {
      const progress = (angle - rotation) / delta
      if (progress <= 0) continue
      // inverso de easeOutCubic: t = 1 - (1 - p)^(1/3)
      ticks.push(durationMs * (1 - Math.cbrt(1 - progress)))
    }

    setSpinning(true)
    sfx.spin(durationMs, ticks)
    setRotation((r) => r + delta)
  }

  function handleEnd() {
    if (!spinning || !target.current) return
    setSpinning(false)
    sfx.spinResult() // "ta-dá" no instante visual exato da parada
    onResult(target.current)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-80 w-80">
        {/* ponteiro */}
        <div
          aria-hidden
          className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 border-x-[14px] border-t-[22px] border-x-transparent border-t-amber-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]"
        />
        <div
          className="wheel-disc h-full w-full rounded-full border-8 border-amber-100/90 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
          onTransitionEnd={handleEnd}
        >
          {themes.map((t, i) => {
            const center = i * seg + seg / 2
            return (
              <span
                key={t}
                aria-hidden
                className="absolute left-1/2 top-1/2 text-3xl"
                style={{
                  transform: `translate(-50%, -50%) rotate(${center}deg) translateY(-108px) rotate(${-center}deg)`,
                }}
              >
                {THEME_META[t].emoji}
              </span>
            )
          })}
        </div>
        {/* miolo */}
        <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-100/90 bg-felt-800 shadow-inner" />
      </div>
      <button className="btn-primary text-lg" onClick={spin} disabled={spinning}>
        {spinning ? 'Girando…' : '🎡 Girar a roleta'}
      </button>
    </div>
  )
}
