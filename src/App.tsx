import { useState } from 'react'
import { ALL_CARDS } from './data/cards'
import { createMatch } from './game/engine'
import type { MatchState } from './game/types'
import { Couple } from './ui/Couple'
import { End } from './ui/End'
import { Home } from './ui/Home'
import { Play } from './ui/Play'
import type { MatchSetup } from './ui/SetupMatch'
import { SetupMatch } from './ui/SetupMatch'

type Screen = 'home' | 'setup' | 'play' | 'end' | 'couple'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [match, setMatch] = useState<MatchState | null>(null)
  const [setup, setSetup] = useState<MatchSetup | null>(null)

  function startMatch(nextSetup: MatchSetup) {
    setSetup(nextSetup)
    setMatch(createMatch(nextSetup.teamNames, ALL_CARDS, nextSetup.config))
    setScreen('play')
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-6">
      {screen === 'home' && (
        <Home
          onGroupMode={() => setScreen('setup')}
          onCoupleMode={() => setScreen('couple')}
        />
      )}

      {screen === 'setup' && (
        <SetupMatch onStart={startMatch} onBack={() => setScreen('home')} />
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
    </main>
  )
}
