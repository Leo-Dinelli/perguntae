/**
 * Efeitos sonoros de interface, gerados com WebAudio (sem arquivos de áudio,
 * funciona offline). Estilo "jogo de perguntas": pops redondos, sinos de
 * acerto, clacks de roleta. Sem música de fundo.
 *
 * Cadeia de saída: fonte → (filtro) → envelope → master → compressor → destino.
 * O compressor evita estalos/clipping quando vários sons se sobrepõem; o
 * envelope com ataque curto elimina o "clique" digital no início de cada nota.
 */

const MUTE_KEY = 'perguntae:muted'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noiseBuf: AudioBuffer | null = null
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

/** Cria o contexto e a cadeia master no primeiro gesto (política de autoplay). */
function audio(): AudioContext | null {
  if (muted) return null
  try {
    if (!ctx) {
      ctx = new AudioContext()
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -18
      compressor.knee.value = 20
      compressor.ratio.value = 4
      compressor.attack.value = 0.003
      compressor.release.value = 0.15
      master = ctx.createGain()
      master.gain.value = 0.9
      master.connect(compressor)
      compressor.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/**
 * Destrava/aquece o áudio dentro de um gesto do usuário (pointerdown).
 * Chamar isso cedo garante que o primeiro sfx toque sem atraso no iOS/Android.
 */
export function unlockAudio(): void {
  void audio()
}

/** Buffer de ruído branco compartilhado (percussão: clacks, swooshes). */
function noiseBuffer(ac: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuf
}

interface ToneOpts {
  freq: number
  /** segundos a partir de agora */
  at?: number
  dur?: number
  type?: OscillatorType
  vol?: number
  /** desliza a frequência até este valor */
  glideTo?: number
  /** rampa de ataque em segundos (evita estalo no onset) */
  attack?: number
  /** corte de um lowpass em Hz — arredonda o timbre */
  lowpass?: number
}

function tone(o: ToneOpts) {
  const ac = audio()
  if (!ac || !master) return
  const start = ac.currentTime + (o.at ?? 0)
  const dur = o.dur ?? 0.1
  const attack = o.attack ?? 0.004
  const vol = o.vol ?? 0.12

  const osc = ac.createOscillator()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.freq, start)
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, start + dur)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(vol, start + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)

  let head: AudioNode = osc
  if (o.lowpass) {
    const filter = ac.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = o.lowpass
    head.connect(filter)
    head = filter
  }
  head.connect(gain)
  gain.connect(master)
  osc.start(start)
  osc.stop(start + dur + 0.03)
}

interface NoiseOpts {
  at?: number
  dur?: number
  vol?: number
  /** frequência central do bandpass */
  band: number
  /** desliza o centro do bandpass (swoosh) */
  bandGlideTo?: number
  /** ressonância do filtro: alto = "clack" seco, baixo = sopro */
  q?: number
}

function noise(o: NoiseOpts) {
  const ac = audio()
  if (!ac || !master) return
  const start = ac.currentTime + (o.at ?? 0)
  const dur = o.dur ?? 0.05
  const vol = o.vol ?? 0.08

  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac)
  // ponto de leitura aleatório para os clacks não soarem idênticos
  const offset = Math.random() * (src.buffer.duration - dur - 0.01)

  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(o.band, start)
  if (o.bandGlideTo) filter.frequency.exponentialRampToValueAtTime(o.bandGlideTo, start + dur)
  filter.Q.value = o.q ?? 1

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(vol, start + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)

  src.connect(filter)
  filter.connect(gain)
  gain.connect(master)
  src.start(start, offset, dur + 0.02)
}

export const sfx = {
  /** botão: "pop" redondo de bolha, resposta imediata ao toque */
  click() {
    tone({ freq: 520, glideTo: 210, dur: 0.07, vol: 0.18, attack: 0.002 })
    noise({ dur: 0.018, vol: 0.04, band: 3200, q: 1.2 })
  },

  /** carta saindo do baralho: swoosh de papel subindo */
  draw() {
    noise({ dur: 0.22, vol: 0.1, band: 500, bandGlideTo: 2400, q: 0.9 })
    tone({ freq: 320, glideTo: 940, dur: 0.2, vol: 0.05, attack: 0.01 })
  },

  /** nova dica revelada: duas notas de marimba (G5 → C6) */
  reveal() {
    tone({ freq: 784, dur: 0.18, vol: 0.13 })
    tone({ freq: 1568, dur: 0.09, vol: 0.035 })
    tone({ freq: 1046, at: 0.09, dur: 0.22, vol: 0.13 })
    tone({ freq: 2093, at: 0.09, dur: 0.11, vol: 0.035 })
  },

  /** dica genial: arpejo cintilante subindo com brilho */
  genius() {
    const notes = [1319, 1568, 1976, 2637] // E6 G6 B6 E7
    notes.forEach((f, i) => {
      tone({ freq: f, at: i * 0.055, dur: 0.16, vol: 0.1 })
      tone({ freq: f * 2, at: i * 0.055, dur: 0.08, vol: 0.025 })
    })
    noise({ at: 0.18, dur: 0.28, vol: 0.02, band: 8000, q: 0.6 })
  },

  /** acertou: sino alegre subindo (C5 E5 G5 → C6 com brilho) */
  correct() {
    tone({ freq: 523, dur: 0.15, vol: 0.12 })
    tone({ freq: 659, at: 0.07, dur: 0.15, vol: 0.12 })
    tone({ freq: 784, at: 0.14, dur: 0.15, vol: 0.12 })
    tone({ freq: 1046, at: 0.21, dur: 0.45, vol: 0.14 })
    tone({ freq: 2093, at: 0.21, dur: 0.22, vol: 0.04 })
  },

  /** errou/desistiu: "wah-wah" descendente, macio (sem punir o ouvido) */
  wrong() {
    tone({ freq: 392, glideTo: 370, dur: 0.16, type: 'triangle', vol: 0.12, lowpass: 900 })
    tone({ freq: 294, at: 0.14, glideTo: 262, dur: 0.28, type: 'triangle', vol: 0.12, lowpass: 700 })
  },

  /** palpite quente (perto): slide animado para cima */
  warm() {
    tone({ freq: 587, glideTo: 880, dur: 0.16, vol: 0.12 })
    tone({ freq: 880, at: 0.13, dur: 0.12, vol: 0.06 })
  },

  /** palpite frio (longe): slide escuro para baixo */
  cold() {
    tone({ freq: 440, glideTo: 294, dur: 0.2, vol: 0.1, lowpass: 1200 })
  },

  /** pular carta: swoosh descendente rápido */
  skip() {
    noise({ dur: 0.16, vol: 0.08, band: 1800, bandGlideTo: 420, q: 1 })
    tone({ freq: 620, glideTo: 260, dur: 0.14, vol: 0.05 })
  },

  /** vitória: fanfarra curta com acorde final e cintilado */
  victory() {
    ;[523, 659, 784].forEach((f, i) => tone({ freq: f, at: i * 0.11, dur: 0.14, vol: 0.12 }))
    ;[1046, 1319, 1568].forEach((f) => tone({ freq: f, at: 0.36, dur: 0.6, vol: 0.09 }))
    tone({ freq: 2093, at: 0.36, dur: 0.4, vol: 0.03 })
    noise({ at: 0.36, dur: 0.35, vol: 0.02, band: 8000, q: 0.6 })
  },

  /**
   * Roleta: um "clack" de madeira para cada fronteira de segmento cruzando o
   * ponteiro (instantes calculados pelo Wheel com o MESMO easing do CSS),
   * e um "ding" quando para.
   */
  spin(durationMs: number, tickTimesMs: number[]) {
    for (const t of tickTimesMs) {
      const at = t / 1000
      // pitch levemente aleatório: clacks orgânicos, não metralhadora
      noise({ at, dur: 0.016, vol: 0.1, band: 1900 + Math.random() * 500, q: 6 })
      tone({ freq: 1150, at, dur: 0.012, vol: 0.02, type: 'square', lowpass: 3000 })
    }
    const end = durationMs / 1000
    tone({ freq: 1319, at: end, dur: 0.3, vol: 0.12 })
    tone({ freq: 2637, at: end, dur: 0.18, vol: 0.04 })
  },
}
