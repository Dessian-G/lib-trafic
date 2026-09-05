import { useEffect, useMemo, useState } from 'react'
import RouteMapView from '../components/RouteMapView'
import RoutePlanner, { type LocationValue, type PointRecherchable } from '../components/RoutePlanner'
import Skeleton from '../components/Skeleton'
import type { GeoPosition } from '../hooks/useGeolocation'
import { useRoute } from '../hooks/useRoute'
import { TRANSPORT_PROFILES, type TransportMode } from '../lib/ors'
import { axeBloqueTraverse, type AxeAvecNiveau } from '../lib/traffic'
import type { Repere, TouristSite } from '../types'

function formatDuree(secondes: number): string {
  const minutes = Math.round(secondes / 60)
  if (minutes < 60) return `${minutes} min`
  const heures = Math.floor(minutes / 60)
  const reste = minutes % 60
  return reste === 0 ? `${heures} h` : `${heures} h ${String(reste).padStart(2, '0')}`
}

interface RoutePageProps {
  userPosition: GeoPosition | null
  reperes: Repere[]
  sites: TouristSite[]
  axesAvecNiveau: AxeAvecNiveau[]
  presetArrivee?: LocationValue | null
}

export default function RoutePage({
  userPosition,
  reperes,
  sites,
  axesAvecNiveau,
  presetArrivee,
}: RoutePageProps) {
  const [depart, setDepart] = useState<LocationValue>({ label: 'Ma position', lat: null, lng: null })
  const [arrivee, setArrivee] = useState<LocationValue>(presetArrivee ?? { label: '', lat: null, lng: null })
  const [departManuel, setDepartManuel] = useState(false)
  const [mode, setMode] = useState<TransportMode>('voiture')

  useEffect(() => {
    if (!departManuel && userPosition) {
      setDepart({ label: 'Ma position', lat: userPosition.lat, lng: userPosition.lng })
    }
  }, [userPosition, departManuel])

  useEffect(() => {
    if (presetArrivee) setArrivee(presetArrivee)
  }, [presetArrivee])

  const options = useMemo<PointRecherchable[]>(
    () => [
      ...reperes.map((r) => ({ id: r.id, name: r.name, lat: r.lat, lng: r.lng })),
      ...sites.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng })),
    ],
    [reperes, sites],
  )

  const departPos = depart.lat !== null && depart.lng !== null ? { lat: depart.lat, lng: depart.lng } : null
  const arriveePos =
    arrivee.lat !== null && arrivee.lng !== null ? { lat: arrivee.lat, lng: arrivee.lng } : null

  const profile = TRANSPORT_PROFILES[mode]
  const { routes, loading, error, retry } = useRoute(
    profile,
    departPos,
    arriveePos,
    profile === 'driving-car',
  )
  const recommande = routes[0] ?? null
  const alternative = routes[1] ?? null

  const axeBloque = recommande ? axeBloqueTraverse(recommande.geometry, axesAvecNiveau) : null
  const alternativeBloquee = alternative
    ? axeBloqueTraverse(alternative.geometry, axesAvecNiveau) !== null
    : false
  const deltaMinutes =
    axeBloque && recommande && alternative
      ? Math.round((alternative.dureeSecondes - recommande.dureeSecondes) / 60)
      : null

  const handleSwap = () => {
    setDepartManuel(true)
    setDepart(arrivee)
    setArrivee(depart)
  }

  const handleUseMaPosition = () => {
    setDepartManuel(false)
  }

  const handleChangeDepart = (v: LocationValue) => {
    setDepartManuel(true)
    setDepart(v)
  }

  const handleDemarrer = () => {
    if (!departPos || !arriveePos) return
    const travelmode = mode === 'pied' ? 'walking' : mode === 'moto' ? 'two-wheeler' : 'driving'
    const url = `https://www.google.com/maps/dir/?api=1&origin=${departPos.lat},${departPos.lng}&destination=${arriveePos.lat},${arriveePos.lng}&travelmode=${travelmode}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-sand-50 dark:bg-night-900">
      <RoutePlanner
        depart={depart}
        arrivee={arrivee}
        onChangeDepart={handleChangeDepart}
        onChangeArrivee={setArrivee}
        onSwap={handleSwap}
        onUseMaPosition={handleUseMaPosition}
        maPositionDisponible={userPosition !== null}
        options={options}
        mode={mode}
        onChangeMode={setMode}
      />

      <div className="relative mt-4 h-[200px] shrink-0">
        <RouteMapView
          depart={departPos}
          arrivee={arriveePos}
          recommande={recommande}
          alternative={alternative}
        />
        {axeBloque && (
          <div className="absolute inset-x-3 top-3 z-10 rounded-field bg-[#FBE4E2] px-3 py-2 text-xs text-[#7A1F17] dark:bg-[#4A2320] dark:text-[#F2564A]">
            Le trajet traverse un axe bloqué ({axeBloque.name}).
            {deltaMinutes !== null && deltaMinutes > 0 &&
              ` Un itinéraire alternatif ajoute ${deltaMinutes} min.`}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-[22px] py-4">
        {!arriveePos && (
          <p className="text-center text-sm text-ink-500 dark:text-mist-200">
            Choisissez une destination.
          </p>
        )}
        {arriveePos && !departPos && (
          <p className="text-center text-sm text-ink-500 dark:text-mist-200">
            Indiquez votre point de départ (activez la géolocalisation ou choisissez-le dans le
            champ « Départ »).
          </p>
        )}

        {arriveePos && departPos && loading && (
          <div className="flex gap-3">
            <Skeleton className="h-[84px] flex-1" />
            <Skeleton className="h-[84px] flex-1" />
          </div>
        )}

        {arriveePos && departPos && error && (
          <div className="flex items-center justify-between rounded-field bg-sand-100 px-4 py-3 text-sm dark:bg-night-700">
            <span className="text-ink-700 dark:text-mist-200">{error}</span>
            <button type="button" onClick={retry} className="font-semibold text-brand-600 dark:text-brand-300">
              Réessayer
            </button>
          </div>
        )}

        {recommande && (
          <div className="flex gap-3">
            <div className="flex-1 rounded-card border-2 border-brand-600 bg-brand-50 p-3 dark:bg-night-700">
              <p className="text-xs font-bold text-brand-600 dark:text-brand-300">RECOMMANDÉ</p>
              <p className="font-display text-2xl font-bold text-ink-900 dark:text-mist-50">
                {formatDuree(recommande.dureeSecondes)}
              </p>
              <p className="text-xs text-ink-600 dark:text-mist-200">
                {(recommande.distanceMetres / 1000).toFixed(1)} km
                {recommande.viaLabel ? ` · via ${recommande.viaLabel}` : ''}
              </p>
            </div>
            {alternative && (
              <div className="flex-1 rounded-card bg-sand-100 p-3 dark:bg-night-700">
                <p className="text-xs font-bold text-ink-500 dark:text-mist-400">
                  LE PLUS COURT {alternativeBloquee ? '🔴' : ''}
                </p>
                <p className="font-display text-2xl font-bold text-ink-700 dark:text-mist-50">
                  {formatDuree(alternative.dureeSecondes)}
                </p>
                <p className="text-xs text-ink-500 dark:text-mist-400">
                  {(alternative.distanceMetres / 1000).toFixed(1)} km
                </p>
              </div>
            )}
          </div>
        )}

        {mode === 'bus' && recommande && (
          <div className="mt-3 rounded-field bg-sand-100 p-3 text-xs text-ink-600 dark:bg-night-700 dark:text-mist-200">
            <p className="font-semibold text-ink-700 dark:text-mist-50">Lignes locales</p>
            <p className="mt-1">Sogatra (Sainte-Marie – Ntoum), Trans'Urb, Trans Akanda.</p>
            <p className="mt-1 text-ink-400 dark:text-mist-400">
              Horaires et lignes indicatifs — à vérifier auprès de l'opérateur.
            </p>
          </div>
        )}

        {recommande && (
          <button
            type="button"
            onClick={handleDemarrer}
            className="mt-4 h-14 w-full rounded-btn bg-brand-600 font-semibold text-white"
          >
            Démarrer
          </button>
        )}
      </div>
    </div>
  )
}
