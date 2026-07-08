import { useRef, useState } from 'react'
import type { ThemeId } from '../game/types'
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
    setSpinning(true)
    setRotation((r) => r + delta)
  }

  function handleEnd() {
    if (!spinning || !target.current) return
    setSpinning(false)
    onResult(target.current)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-72 w-72">
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
                  transform: `translate(-50%, -50%) rotate(${center}deg) translateY(-96px) rotate(${-center}deg)`,
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
