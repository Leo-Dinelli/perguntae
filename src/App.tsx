import { useEffect, useRef, useState } from 'react'
import { ALL_CARDS } from './data/cards'
import { createMatch, winners } from './game/engine'
import type { MatchState } from './game/types'
import { saveMatch } from './history'
import { Couple } from './ui/Couple'
import { End } from './ui/End'
import { History } from './ui/History'
import { Home } from './ui/Home'
import { Play } from './ui/Play'
import type { MatchSetup } from './ui/SetupMatch'
import { SetupMatch } from './ui/SetupMatch'

type Screen = 'home' | 'setup' | 'play' | 'end' | 'couple' | 'history'

/** randomUUID exige contexto seguro; no http da rede local usamos fallback */
function newMatchId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [setupMode, setSetupMode] = useState<'grupo' | 'solo'>('grupo')
  const [match, setMatch] = useState<MatchState | null>(null)
  const [setup, setSetup] = useState<MatchSetup | null>(null)
  const matchIdRef = useRef('')

  function startMatch(nextSetup: MatchSetup) {
    matchIdRef.current = newMatchId()
    setSetup(nextSetup)
    setMatch(createMatch(nextSetup.teamNames, ALL_CARDS, nextSetup.config))
    setScreen('play')
  }

  useEffect(() => {
    if (screen !== 'end' || !match || !setup) return
    saveMatch({
      id: matchIdRef.current,
      endedAt: new Date().toISOString(),
      themeChoice: setup.config.themeChoice,
      roulette: setup.roulette,
      difficulty: setup.config.difficulty,
      totalRounds: setup.config.totalRounds,
      teams: match.teams.map((t) => ({ name: t.name, score: t.score })),
      winners: winners(match).map((t) => t.name),
    })
  }, [screen, match, setup])

  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-6">
      {screen === 'home' && (
        <Home
          onGroupMode={() => {
            setSetupMode('grupo')
            setScreen('setup')
          }}
          onSoloMode={() => {
            setSetupMode('solo')
            setScreen('setup')
          }}
          onCoupleMode={() => setScreen('couple')}
          onHistory={() => setScreen('history')}
        />
      )}

      {screen === 'setup' && (
        <SetupMatch
          mode={setupMode}
          onStart={startMatch}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'play' && match && setup && (
        <Play
          match={match}
          roulette={setup.roulette}
          onChange={setMatch}
          onFinish={() => setScreen('end')}
          onQuit={() => setScreen('home')}
        />
      )}

      {screen === 'end' && match && setup && (
        <End
          match={match}
          onRematch={() => startMatch(setup)}
          onNewSetup={() => setScreen('setup')}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'couple' && <Couple onExit={() => setScreen('home')} />}

      {screen === 'history' && <History onBack={() => setScreen('home')} />}
    </main>
  )
}
