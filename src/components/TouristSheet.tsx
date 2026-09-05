import { Heart, MapPin, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../lib/tourism'
import type { TouristSite } from '../types'

interface TouristSheetProps {
  site: TouristSite
  distanceLabel: string | null
  estFavori: boolean
  onToggleFavori: () => void
  onClose: () => void
  onNaviguer: () => void
}

export default function TouristSheet({
  site,
  distanceLabel,
  estFavori,
  onToggleFavori,
  onClose,
  onNaviguer,
}: TouristSheetProps) {
  const positionConnue = site.lat !== null && site.lng !== null
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="absolute inset-0 z-20 flex items-end bg-[rgba(16,21,18,.45)]" onClick={onClose}>
      <div
        className={`w-full overflow-hidden rounded-t-sheet bg-sand-50 pb-6 transition-transform duration-300 ease-out motion-reduce:transition-none dark:bg-night-800 ${
          entered ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex h-[140px] items-end justify-between p-4"
          style={{ backgroundColor: CATEGORY_COLORS[site.category] }}
        >
          <span className="rounded-full bg-[rgba(22,33,28,.7)] px-2 py-1 text-[11px] font-bold uppercase tracking-[.08em] text-white">
            {CATEGORY_LABELS[site.category]}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(22,33,28,.5)] text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-xl font-bold dark:text-mist-50">{site.name}</h2>
            <button
              type="button"
              onClick={onToggleFavori}
              aria-label="Favori"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-sand-100 dark:bg-night-700"
            >
              <Heart
                size={20}
                className={estFavori ? 'fill-accent-500 text-accent-500' : 'text-ink-400 dark:text-mist-400'}
              />
            </button>
          </div>

          {(distanceLabel || site.quartier) && (
            <p className="mt-1 flex items-center gap-1 text-sm text-brand-600 dark:text-brand-300">
              <MapPin size={14} />
              {[distanceLabel, site.quartier].filter(Boolean).join(' · ')}
            </p>
          )}

          <p className="mt-3 text-sm text-ink-700 dark:text-mist-200">{site.description}</p>
          {site.hours && (
            <p className="mt-2 text-xs text-ink-400 dark:text-mist-400">{site.hours}</p>
          )}

          <button
            type="button"
            disabled={!positionConnue}
            onClick={onNaviguer}
            className="mt-5 h-14 w-full rounded-btn bg-brand-600 font-semibold text-white disabled:bg-sand-200 disabled:text-ink-300 dark:disabled:bg-night-700 dark:disabled:text-mist-500"
          >
            {positionConnue ? "M'y rendre" : 'Position à vérifier'}
          </button>
        </div>
      </div>
    </div>
  )
}
