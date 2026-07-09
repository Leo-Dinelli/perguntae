/**
 * Efeitos sonoros de interface, gerados com WebAudio (sem arquivos de áudio,
 * funciona offline). Estilo "jogo de perguntas": blips curtos, arpejos de
 * acerto, tique de roleta. Sem música de fundo.
 */

const MUTE_KEY = 'perguntae:muted'

let ctx: AudioContext | null = null
let muted = false

try {
  muted = localStorage.getItem(MUTE_KEY) === '1'
} catch {
  // storage indisponível: começa com som ligado
}

export function isMuted(): boolean {
  return muted
}

export function toggleMuted(): boolean {
  muted = !muted
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // sem storage, o estado vale só para a sessão
  }
  return muted
}

/** Cria o contexto no primeiro gesto do usuário (política de autoplay). */
function audio(): AudioContext | null {
  if (muted) return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

interface Tone {
  freq: number
  /** segundos a partir de agora */
  at?: number
  duration?: number
  type?: OscillatorType
  volume?: number
  /** desliza a frequência até este valor */
  glideTo?: number
}

function play(tones: Tone[]) {
  const ac = audio()
  if (!ac) return
  const now = ac.currentTime
  for (const t of tones) {
    const start = now + (t.at ?? 0)
    const duration = t.duration ?? 0.08
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = t.type ?? 'sine'
    osc.frequency.setValueAtTime(t.freq, start)
    if (t.glideTo) osc.frequency.exponentialRampToValueAtTime(t.glideTo, start + duration)
    const volume = t.volume ?? 0.12
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain).connect(ac.destination)
    osc.start(start)
    osc.stop(start + duration + 0.02)
  }
}

export const sfx = {
  /** blip curto de botão */
  click() {
    play([{ freq: 620, duration: 0.05, type: 'square', volume: 0.05 }])
  },

  /** carta saindo do baralho */
  draw() {
    play([{ freq: 220, glideTo: 880, duration: 0.16, type: 'sawtooth', volume: 0.07 }])
  },

  /** nova dica revelada */
  reveal() {
    play([
      { freq: 780, duration: 0.06 },
      { freq: 1180, at: 0.06, duration: 0.09 },
    ])
  },

  /** dica genial: brilhinho */
  genius() {
    play([
      { freq: 1568, duration: 0.09 },
      { freq: 2093, at: 0.08, duration: 0.12 },
      { freq: 2637, at: 0.16, duration: 0.16, volume: 0.08 },
    ])
  },

  /** acertou: arpejo alegre estilo quiz */
  correct() {
    play([
      { freq: 523, duration: 0.12 },
      { freq: 659, at: 0.09, duration: 0.12 },
      { freq: 784, at: 0.18, duration: 0.12 },
      { freq: 1047, at: 0.27, duration: 0.24 },
    ])
  },

  /** errou/desistiu: duas notas caindo */
  wrong() {
    play([
      { freq: 392, duration: 0.14, type: 'triangle' },
      { freq: 262, at: 0.13, duration: 0.22, type: 'triangle' },
    ])
  },

  /** palpite quente (perto) */
  warm() {
    play([{ freq: 660, glideTo: 990, duration: 0.14, type: 'triangle' }])
  },

  /** palpite frio (longe) */
  cold() {
    play([{ freq: 330, glideTo: 240, duration: 0.16, type: 'triangle', volume: 0.08 }])
  },

  /** pular carta: chirp descendo */
  skip() {
    play([{ freq: 700, glideTo: 320, duration: 0.12, type: 'square', volume: 0.06 }])
  },

  /** vitória: fanfarra curtinha */
  victory() {
    play([
      { freq: 523, duration: 0.14 },
      { freq: 659, at: 0.12, duration: 0.14 },
      { freq: 784, at: 0.24, duration: 0.14 },
      { freq: 1047, at: 0.36, duration: 0.3 },
      { freq: 784, at: 0.52, duration: 0.12, volume: 0.08 },
      { freq: 1047, at: 0.62, duration: 0.4 },
    ])
  },

  /** roleta girando: tiques desacelerando junto com o easing do giro */
  spin(durationMs: number) {
    const ac = audio()
    if (!ac) return
    const total = durationMs / 1000
    const ticks: Tone[] = []
    // easing ~cúbico: mais tiques no começo, raleando até parar
    for (let i = 0; i < 26; i++) {
      const progress = i / 26
      const at = total * (1 - Math.pow(1 - progress, 3))
      ticks.push({ freq: 950, at, duration: 0.025, type: 'square', volume: 0.05 })
    }
    ticks.push({ freq: 1400, at: total, duration: 0.18, volume: 0.1 })
    play(ticks)
  },
}
