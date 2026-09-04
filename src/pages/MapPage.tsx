import { Locate, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import MapView, { type MapViewHandle } from '../components/MapView'
import ReportButton from '../components/ReportButton'
import TrafficLegend from '../components/TrafficLegend'
import type { GeoPosition } from '../hooks/useGeolocation'
import type { Repere } from '../types'

type Filtre = 'tout' | 'bouchons' | 'accidents' | 'sites'

const FILTRES: { id: Filtre; label: string }[] = [
  { id: 'tout', label: 'Tout' },
  { id: 'bouchons', label: 'Bouchons' },
  { id: 'accidents', label: 'Accidents' },
  { id: 'sites', label: 'Sites' },
]

interface MapPageProps {
  userPosition: GeoPosition | null
  onRequestPosition: () => void
  onOpenReport: () => void
}

export default function MapPage({ userPosition, onRequestPosition, onOpenReport }: MapPageProps) {
  const mapHandleRef = useRef<MapViewHandle | null>(null)
  const [recenterSignal, setRecenterSignal] = useState(0)
  const [filtre, setFiltre] = useState<Filtre>('tout')
  const [query, setQuery] = useState('')
  const [reperes, setReperes] = useState<Repere[]>([])

  useEffect(() => {
    fetch('/data/quartiers.json')
      .then((res) => res.json())
      .then(setReperes)
      .catch(() => setReperes([]))
  }, [])

  const resultats =
    query.trim().length > 0
      ? reperes
          .filter(
            (r) => r.lat !== null && r.name.toLowerCase().includes(query.trim().toLowerCase()),
          )
          .slice(0, 6)
      : []

  const handleMaPosition = () => {
    onRequestPosition()
    setRecenterSignal((n) => n + 1)
  }

  const handleSelectRepere = (r: Repere) => {
    if (r.lat === null || r.lng === null) return
    mapHandleRef.current?.flyTo({ lat: r.lat, lng: r.lng }, 15)
    setQuery('')
  }

  return (
    <div className="relative h-full w-full">
      <MapView userPosition={userPosition} recenterSignal={recenterSignal} mapRef={mapHandleRef} />

      <div className="absolute inset-x-0 top-0 z-10 px-[22px] pt-[52px]">
        <div className="flex items-center gap-2">
          <div className="flex h-[52px] flex-1 items-center gap-2 rounded-card bg-[rgba(251,247,240,.94)] px-4 shadow-[0_6px_20px_rgba(22,33,28,.14)] backdrop-blur">
            <Search size={18} className="text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un quartier, un axe…"
              className="h-full flex-1 bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
            />
          </div>
          <button
            type="button"
            aria-label="Filtres"
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[rgba(251,247,240,.94)] shadow-[0_6px_20px_rgba(22,33,28,.14)]"
          >
            <SlidersHorizontal size={16} className="text-ink-700" />
          </button>
        </div>

        {resultats.length > 0 && (
          <ul className="mt-2 overflow-hidden rounded-card bg-sand-50 shadow-[0_6px_20px_rgba(22,33,28,.14)]">
            {resultats.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => handleSelectRepere(r)}
                  className="flex h-11 w-full items-center px-4 text-left text-sm text-ink-900 active:bg-sand-100"
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex gap-2 overflow-x-auto">
          {FILTRES.map(({ id, label }) => {
            const isActive = id === filtre
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFiltre(id)}
                className={`h-8 shrink-0 rounded-full px-3 text-[13px] font-semibold ${
                  isActive ? 'bg-brand-600 text-white' : 'bg-sand-100 text-ink-600'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-[18px] left-[18px] z-10">
        <TrafficLegend />
      </div>

      <div className="absolute bottom-[18px] right-[18px] z-10 flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={handleMaPosition}
          aria-label="Ma position"
          className="flex h-12 w-12 items-center justify-center rounded-card bg-ocean-600 text-white shadow-[0_6px_20px_rgba(22,33,28,.14)]"
        >
          <Locate size={20} />
        </button>
        <ReportButton onClick={onOpenReport} />
      </div>
    </div>
  )
}
