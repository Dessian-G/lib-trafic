import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import CommunesMap from './CommunesMap'
import type { CommuneZone } from '../types'

interface CommunesSheetProps {
  onClose: () => void
}

export default function CommunesSheet({ onClose }: CommunesSheetProps) {
  const [communes, setCommunes] = useState<CommuneZone[]>([])
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    fetch('/data/communes.json')
      .then((r) => r.json())
      .then(setCommunes)
      .catch(() => setCommunes([]))
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="absolute inset-0 z-20 flex items-end bg-[rgba(16,21,18,.45)]" onClick={onClose}>
      <div
        className={`flex h-[88%] w-full flex-col overflow-hidden rounded-t-sheet bg-sand-50 transition-transform duration-300 ease-out motion-reduce:transition-none dark:bg-night-800 ${
          entered ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-3 h-[5px] w-11 shrink-0 rounded-full bg-sand-300 dark:bg-night-500" />

        <div className="flex shrink-0 items-center justify-between px-6 pt-3 pb-3">
          <h2 className="font-display text-xl font-bold dark:text-mist-50">
            Communes du Grand Libreville
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-sand-100 dark:bg-night-700"
          >
            <X size={18} className="text-ink-700 dark:text-mist-200" />
          </button>
        </div>

        <div className="relative flex-1">
          <CommunesMap communes={communes} />

          <div className="absolute inset-x-3 bottom-3 rounded-card bg-[rgba(251,247,240,.94)] p-3 text-xs shadow-[0_6px_20px_rgba(22,33,28,.14)] dark:bg-[rgba(25,32,28,.9)]">
            <p className="mb-1.5 font-semibold text-ink-700 dark:text-mist-200">Légende</p>
            <div className="flex flex-col gap-1">
              {communes.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-ink-600 dark:text-mist-200">
                    {c.name}
                    {!c.boundary && ' — centre seulement'}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-ink-400 dark:text-mist-400">
              Frontière officielle disponible uniquement pour Libreville (OpenStreetMap). Les
              autres communes sont indiquées par leur centre, faute de tracé administratif
              numérisé.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
