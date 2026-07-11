import { useState } from 'react'
import { analyticsAvailable, setConsent, storedConsent } from '../analytics'
import type { Consent } from '../analytics'

/** aviso de cookies (LGPD): o GA só carrega se o usuário aceitar aqui */
export function ConsentBanner() {
  const [visible, setVisible] = useState(
    () => analyticsAvailable() && storedConsent() === null,
  )

  if (!visible) return null

  function choose(consent: Consent) {
    setConsent(consent)
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/15 bg-felt-800/95 px-4 py-3 shadow-lg backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-xl flex-wrap items-center gap-3">
        <p className="min-w-48 flex-1 text-sm text-card/90">
          Usamos cookies do Google Analytics só pra medir visitas e melhorar o
          jogo. Tudo bem?
        </p>
        <div className="flex gap-2">
          <button
            className="btn border border-white/20 bg-transparent text-card/80"
            onClick={() => choose('denied')}
          >
            Recusar
          </button>
          <button
            className="btn bg-amber-400 text-ink"
            onClick={() => choose('granted')}
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
