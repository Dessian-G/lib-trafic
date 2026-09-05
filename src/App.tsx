import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import BottomNav, { type TabId } from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import OfflineBanner from './components/OfflineBanner'
import Onboarding from './components/Onboarding'
import type { LocationValue } from './components/RoutePlanner'
import { useGeolocation } from './hooks/useGeolocation'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useTrafficReports } from './hooks/useTrafficReports'
import { niveauAxe } from './lib/traffic'
import type { Axe, Repere, TouristSite } from './types'

// Chargement paresseux par onglet : Leaflet (Carte/Itineraire) et Firebase
// ne sont telecharges qu'une fois l'onboarding passe, et chaque page n'est
// chargee qu'a la premiere visite de son onglet (frugalite reseau, §1).
const MapPage = lazy(() => import('./pages/MapPage'))
const RoutePage = lazy(() => import('./pages/RoutePage'))
const TourismPage = lazy(() => import('./pages/TourismPage'))

const ONBOARDING_KEY = 'libtrafic_onboarding_done'

function App() {
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === '1',
  )
  const [tab, setTab] = useState<TabId>('carte')
  const [presetArrivee, setPresetArrivee] = useState<LocationValue | null>(null)
  const { position, requestPosition } = useGeolocation()
  const { online, offlineSince } = useOnlineStatus()

  const [reperes, setReperes] = useState<Repere[]>([])
  const [axes, setAxes] = useState<Axe[]>([])
  const [sites, setSites] = useState<TouristSite[]>([])
  const [sitesLoaded, setSitesLoaded] = useState(false)
  const { reports, error: reportsError, retry: retryReports } = useTrafficReports()

  useEffect(() => {
    fetch('/data/quartiers.json').then((r) => r.json()).then(setReperes).catch(() => setReperes([]))
    fetch('/data/axes.json').then((r) => r.json()).then(setAxes).catch(() => setAxes([]))
    fetch('/data/sites-touristiques.json')
      .then((r) => r.json())
      .then(setSites)
      .catch(() => setSites([]))
      .finally(() => setSitesLoaded(true))
  }, [])

  const axesAvecNiveau = useMemo(
    () => axes.map((axe) => ({ axe, niveau: niveauAxe(axe, reports) })),
    [axes, reports],
  )

  // L'itineraire exige le reseau (ORS) : si on passe hors ligne pendant qu'on
  // y est, on revient sur la carte plutot que de laisser un onglet devenu
  // inaccessible depuis la nav rester affiche (DESIGN.md §5.7).
  useEffect(() => {
    if (!online && tab === 'itineraire') setTab('carte')
  }, [online, tab])

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
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-sand-50 dark:bg-night-900">
      <OfflineBanner offlineSince={offlineSince} />
      <div className="relative flex-1 overflow-hidden">
        <Suspense fallback={<div className="h-full w-full bg-sand-50 dark:bg-night-900" />}>
          {tab === 'carte' && (
            <MapPage
              userPosition={position}
              onRequestPosition={requestPosition}
              onNavigateToRoute={() => setTab('itineraire')}
              reperes={reperes}
              reports={reports}
              reportsError={reportsError}
              onRetryReports={retryReports}
              axesAvecNiveau={axesAvecNiveau}
              offline={!online}
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
              sitesLoaded={sitesLoaded}
              reperes={reperes}
              userPosition={position}
              onNavigateToSite={(arrivee) => {
                setPresetArrivee(arrivee)
                setTab('itineraire')
              }}
            />
          )}
        </Suspense>
      </div>
      <BottomNav active={tab} onChange={setTab} offline={!online} />
      <InstallPrompt />
    </div>
  )
}

export default App
