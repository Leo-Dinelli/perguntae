/**
 * Google Analytics 4, carregado apenas em produção e após consentimento
 * explícito do usuário (LGPD) — antes disso nenhum script/cookie do Google
 * entra na página. Com GA_ID vazio tudo aqui vira no-op, então é seguro
 * deployar antes de criar a propriedade no GA.
 */
const GA_ID: string = 'G-9GKNL0GC1H'

const CONSENT_KEY = 'perguntae:analytics-consent'

export type Consent = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function analyticsAvailable(): boolean {
  return GA_ID !== '' && import.meta.env.PROD
}

export function storedConsent(): Consent | null {
  const value = localStorage.getItem(CONSENT_KEY)
  return value === 'granted' || value === 'denied' ? value : null
}

export function setConsent(consent: Consent) {
  localStorage.setItem(CONSENT_KEY, consent)
  if (consent === 'granted') loadGa()
}

/** chamar uma vez na inicialização: retoma o GA se o usuário já consentiu */
export function initAnalytics() {
  if (storedConsent() === 'granted') loadGa()
}

/** evento customizado; vira no-op sem consentimento ou sem GA_ID */
export function track(event: string, params?: Record<string, string | number | boolean>) {
  window.gtag?.('event', event, params)
}

let loaded = false

function loadGa() {
  if (loaded || !analyticsAvailable()) return
  loaded = true
  window.dataLayer = window.dataLayer ?? []
  // o gtag.js espera objetos `arguments` no dataLayer — arrays não funcionam
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
}
