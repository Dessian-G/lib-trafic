import { useEffect, useMemo, useState } from 'react'
import BottomNav, { type TabId } from './components/BottomNav'
import Onboarding from './components/Onboarding'
import type { LocationValue } from './components/RoutePlanner'
import { useGeolocation } from './hooks/useGeolocation'
import { useTrafficReports } from './hooks/useTrafficReports'
import { niveauAxe } from './lib/traffic'
import MapPage from './pages/MapPage'
import RoutePage from './pages/RoutePage'
import TourismPage from './pages/TourismPage'
import type { Axe, Repere, TouristSite } from './types'

const ONBOARDING_KEY = 'libtrafic_onboarding_done'

function App() {
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === '1',
  )
  const [tab, setTab] = useState<TabId>('carte')
  const [presetArrivee, setPresetArrivee] = useState<LocationValue | null>(null)
  const { position, requestPosition } = useGeolocation()

  const [reperes, setReperes] = useState<Repere[]>([])
  const [axes, setAxes] = useState<Axe[]>([])
  const [sites, setSites] = useState<TouristSite[]>([])
  const reports = useTrafficReports()

  useEffect(() => {
    fetch('/data/quartiers.json').then((r) => r.json()).then(setReperes).catch(() => setReperes([]))
    fetch('/data/axes.json').then((r) => r.json()).then(setAxes).catch(() => setAxes([]))
    fetch('/data/sites-touristiques.json')
      .then((r) => r.json())
      .then(setSites)
      .catch(() => setSites([]))
  }, [])

  const axesAvecNiveau = useMemo(
    () => axes.map((axe) => ({ axe, niveau: niveauAxe(axe, reports) })),
    [axes, reports],
  )

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
            reperes={reperes}
            reports={reports}
            axesAvecNiveau={axesAvecNiveau}
          />
        )}
        {tab === 'itineraire' && (
          <RoutePage
            userPosition={position}
            reperes={reperes}
            sites={sites}
            axesAvecNiveau={axesAvecNiveau}
            presetArrivee={presetArrivee}
          />
        )}
        {tab === 'sites' && (
          <TourismPage
            sites={sites}
            reperes={reperes}
            userPosition={position}
            onNavigateToSite={(arrivee) => {
              setPresetArrivee(arrivee)
              setTab('itineraire')
            }}
          />
        )}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default App
