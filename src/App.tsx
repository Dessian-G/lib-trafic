import { useState } from 'react'
import BottomNav, { type TabId } from './components/BottomNav'
import Onboarding from './components/Onboarding'
import { useGeolocation } from './hooks/useGeolocation'
import MapPage from './pages/MapPage'
import RoutePage from './pages/RoutePage'
import TourismPage from './pages/TourismPage'

const ONBOARDING_KEY = 'libtrafic_onboarding_done'

function App() {
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === '1',
  )
  const [tab, setTab] = useState<TabId>('carte')
  const { position, requestPosition } = useGeolocation()

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setOnboardingDone(true)
  }

  if (!onboardingDone) {
    return (
      <Onboarding
        onAuthorize={() => {
          requestPosition()
          finishOnboarding()
        }}
        onSkip={finishOnboarding}
      />
    )
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-sand-50">
      <div className="relative flex-1 overflow-hidden">
        {tab === 'carte' && (
          <MapPage
            userPosition={position}
            onRequestPosition={requestPosition}
            onNavigateToRoute={() => setTab('itineraire')}
          />
        )}
        {tab === 'itineraire' && <RoutePage />}
        {tab === 'sites' && <TourismPage />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default App
