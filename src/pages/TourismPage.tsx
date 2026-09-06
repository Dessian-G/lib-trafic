import { Heart, MapPinned } from 'lucide-react'
import { useMemo, useState } from 'react'
import CommunesSheet from '../components/CommunesSheet'
import type { LocationValue } from '../components/RoutePlanner'
import Skeleton from '../components/Skeleton'
import TouristSheet from '../components/TouristSheet'
import { useFavorites } from '../hooks/useFavorites'
import type { GeoPosition } from '../hooks/useGeolocation'
import { distanceMetres, nearestWithDistance, triParDistance } from '../lib/geo'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../lib/tourism'
import type { Repere, TouristCategory, TouristSite } from '../types'

type FiltreCategorie = 'tous' | TouristCategory

const CATEGORIES: FiltreCategorie[] = [
  'tous',
  'culturel',
  'plage',
  'nature',
  'religieux',
  'marche',
  'monument',
]

function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres / 50) * 50} m`
  return `${(metres / 1000).toFixed(1)} km`
}

interface TourismPageProps {
  sites: TouristSite[]
  sitesLoaded: boolean
  reperes: Repere[]
  userPosition: GeoPosition | null
  onNavigateToSite: (arrivee: LocationValue) => void
}

export default function TourismPage({
  sites,
  sitesLoaded,
  reperes,
  userPosition,
  onNavigateToSite,
}: TourismPageProps) {
  const [filtre, setFiltre] = useState<FiltreCategorie>('tous')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [communesOuvert, setCommunesOuvert] = useState(false)
  const { estFavori, toggleFavori } = useFavorites()

  const quartiers = useMemo(() => reperes.filter((r) => r.type === 'quartier'), [reperes])
  const quartierProche = userPosition
    ? (nearestWithDistance(userPosition, quartiers)?.item.name ?? null)
    : null

  const sitesTries = useMemo(() => {
    const filtres = sites.filter((s) => filtre === 'tous' || s.category === filtre)
    if (userPosition) return triParDistance(userPosition, filtres)
    return [...filtres].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  }, [sites, filtre, userPosition])

  const distanceDe = (site: TouristSite): string | null => {
    if (!userPosition || site.lat === null || site.lng === null) return null
    return formatDistance(distanceMetres(userPosition, { lat: site.lat, lng: site.lng }))
  }

  const selectedSite = sitesTries.find((s) => s.id === selectedId) ?? null

  const handleNaviguer = (site: TouristSite) => {
    if (site.lat === null || site.lng === null) return
    onNavigateToSite({ label: site.name, lat: site.lat, lng: site.lng })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-sand-50 dark:bg-night-900">
      <div className="flex items-start justify-between gap-3 px-[22px] pt-6">
        <div>
          <h1 className="font-display text-2xl font-bold dark:text-mist-50">Sites à découvrir</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-mist-200">
            {userPosition && quartierProche
              ? `◎ Triés par distance depuis ${quartierProche}`
              : 'Triés par ordre alphabétique'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCommunesOuvert(true)}
          className="mt-1 flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-300"
        >
          <MapPinned size={14} />
          Communes
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto px-[22px]">
        {CATEGORIES.map((c) => {
          const isActive = c === filtre
          const label = c === 'tous' ? 'Tous' : CATEGORY_LABELS[c]
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFiltre(c)}
              className={`h-8 shrink-0 rounded-full px-3 text-[13px] font-semibold ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'bg-sand-100 text-ink-600 dark:bg-night-700 dark:text-mist-200'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-[22px] pb-6">
        {!sitesLoaded && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[220px] w-full" />
            <Skeleton className="h-[104px] w-full" />
            <Skeleton className="h-[104px] w-full" />
          </div>
        )}

        {sitesLoaded &&
          sitesTries.map((site, index) => {
            const distanceLabel = distanceDe(site)
            const positionConnue = site.lat !== null && site.lng !== null

            if (index === 0) {
              return (
                <div
                  key={site.id}
                  className="mb-3 shrink-0 overflow-hidden rounded-card bg-sand-100 dark:bg-night-700"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(site.id)}
                    className="block w-full text-left"
                  >
                    <div
                      className="flex h-[112px] items-end p-3"
                      style={{ backgroundColor: CATEGORY_COLORS[site.category] }}
                    >
                      <span className="rounded-full bg-[rgba(22,33,28,.7)] px-2 py-1 text-[11px] font-bold uppercase tracking-[.08em] text-white">
                        {CATEGORY_LABELS[site.category]}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-display text-lg font-bold dark:text-mist-50">{site.name}</p>
                      {distanceLabel && (
                        <p className="text-[13px] font-bold text-brand-600 dark:text-brand-300">
                          {distanceLabel}
                        </p>
                      )}
                      <p className="mt-1 text-[13px] text-ink-600 dark:text-mist-200">
                        {site.description}
                      </p>
                    </div>
                  </button>
                  <div className="flex gap-2 px-3 pb-3">
                    <button
                      type="button"
                      disabled={!positionConnue}
                      onClick={() => handleNaviguer(site)}
                      className="flex h-11 flex-1 items-center justify-center gap-1 rounded-btn bg-brand-600 text-sm font-semibold text-white disabled:bg-sand-200 disabled:text-ink-300 dark:disabled:bg-night-600 dark:disabled:text-mist-500"
                    >
                      ➟ M'y rendre
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavori(site.id)}
                      aria-label="Favori"
                      className="flex h-11 w-11 items-center justify-center rounded-btn bg-sand-100 dark:bg-night-600"
                    >
                      <Heart
                        size={18}
                        className={
                          estFavori(site.id) ? 'fill-accent-500 text-accent-500' : 'text-ink-400 dark:text-mist-400'
                        }
                      />
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <button
                key={site.id}
                type="button"
                onClick={() => setSelectedId(site.id)}
                className="mb-2 flex w-full shrink-0 gap-3 rounded-card bg-sand-100 p-2 text-left dark:bg-night-700"
              >
                <div
                  className="h-[104px] w-[104px] shrink-0 rounded-field"
                  style={{ backgroundColor: CATEGORY_COLORS[site.category] }}
                />
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="truncate text-base font-bold text-ink-900 dark:text-mist-50">
                    {site.name}
                  </p>
                  {distanceLabel && (
                    <p className="text-xs font-bold text-brand-600 dark:text-brand-300">
                      {distanceLabel}
                    </p>
                  )}
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-500 dark:text-mist-200">
                    {site.description}
                  </p>
                  <span className="mt-1 inline-block w-fit rounded-full bg-sand-200 px-2 py-0.5 text-[11px] font-semibold text-ink-600 dark:bg-night-600 dark:text-mist-200">
                    {CATEGORY_LABELS[site.category]}
                  </span>
                </div>
              </button>
            )
          })}
      </div>

      {selectedSite && (
        <TouristSheet
          site={selectedSite}
          distanceLabel={distanceDe(selectedSite)}
          estFavori={estFavori(selectedSite.id)}
          onToggleFavori={() => toggleFavori(selectedSite.id)}
          onClose={() => setSelectedId(null)}
          onNaviguer={() => {
            handleNaviguer(selectedSite)
            setSelectedId(null)
          }}
        />
      )}

      {communesOuvert && <CommunesSheet onClose={() => setCommunesOuvert(false)} />}
    </div>
  )
}
