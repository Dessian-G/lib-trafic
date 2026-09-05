import { ArrowUpDown } from 'lucide-react'
import { useState } from 'react'
import TransportPicker from './TransportPicker'
import type { TransportMode } from '../lib/ors'

export interface PointRecherchable {
  id: string
  name: string
  lat: number | null
  lng: number | null
}

export interface LocationValue {
  label: string
  lat: number | null
  lng: number | null
}

interface LocationFieldProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
  placeholder: string
  options: PointRecherchable[]
  maPositionDisponible: boolean
  onUseMaPosition: () => void
}

function LocationField({
  value,
  onChange,
  placeholder,
  options,
  maPositionDisponible,
  onUseMaPosition,
}: LocationFieldProps) {
  const [editing, setEditing] = useState(false)
  const [texte, setTexte] = useState('')

  const resultats =
    editing && texte.trim().length > 0
      ? options.filter((o) => o.lat !== null && o.name.toLowerCase().includes(texte.toLowerCase())).slice(0, 5)
      : []

  return (
    <div className="relative flex-1">
      <input
        value={editing ? texte : value.label}
        onChange={(e) => setTexte(e.target.value)}
        onFocus={() => {
          setEditing(true)
          setTexte('')
        }}
        onBlur={() => setTimeout(() => setEditing(false), 150)}
        placeholder={placeholder}
        className={`h-[52px] w-full rounded-field bg-sand-100 px-4 text-[15px] text-ink-900 outline-none placeholder:text-ink-400 dark:bg-night-700 dark:text-mist-50 dark:placeholder:text-mist-500 ${
          editing ? 'border-2 border-brand-600' : ''
        }`}
      />
      {editing && (
        <ul className="absolute left-0 right-0 top-[56px] z-10 overflow-hidden rounded-card bg-sand-50 shadow-[0_6px_20px_rgba(22,33,28,.14)] dark:bg-night-800">
          {maPositionDisponible && (
            <li>
              <button
                type="button"
                onMouseDown={() => onUseMaPosition()}
                className="flex h-11 w-full items-center px-4 text-left text-sm font-semibold text-ocean-600 active:bg-sand-100 dark:text-ocean-400 dark:active:bg-night-700"
              >
                Ma position
              </button>
            </li>
          )}
          {resultats.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onMouseDown={() => onChange({ label: o.name, lat: o.lat, lng: o.lng })}
                className="flex h-11 w-full items-center px-4 text-left text-sm text-ink-900 active:bg-sand-100 dark:text-mist-50 dark:active:bg-night-700"
              >
                {o.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface RoutePlannerProps {
  depart: LocationValue
  arrivee: LocationValue
  onChangeDepart: (v: LocationValue) => void
  onChangeArrivee: (v: LocationValue) => void
  onSwap: () => void
  onUseMaPosition: () => void
  maPositionDisponible: boolean
  options: PointRecherchable[]
  mode: TransportMode
  onChangeMode: (mode: TransportMode) => void
}

export default function RoutePlanner({
  depart,
  arrivee,
  onChangeDepart,
  onChangeArrivee,
  onSwap,
  onUseMaPosition,
  maPositionDisponible,
  options,
  mode,
  onChangeMode,
}: RoutePlannerProps) {
  return (
    <div className="px-[22px] pt-4">
      <div className="flex items-center gap-3">
        <div className="flex h-[108px] flex-col items-center justify-between py-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ocean-600" />
          <span className="w-px flex-1 bg-sand-300 dark:bg-night-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <LocationField
            value={depart}
            onChange={onChangeDepart}
            placeholder="Départ"
            options={options}
            maPositionDisponible={maPositionDisponible}
            onUseMaPosition={onUseMaPosition}
          />
          <LocationField
            value={arrivee}
            onChange={onChangeArrivee}
            placeholder="Où allez-vous ?"
            options={options}
            maPositionDisponible={false}
            onUseMaPosition={onUseMaPosition}
          />
        </div>
        <button
          type="button"
          aria-label="Inverser départ et arrivée"
          onClick={onSwap}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand-100 text-ink-600 dark:bg-night-700 dark:text-mist-200"
        >
          <ArrowUpDown size={18} />
        </button>
      </div>

      <div className="mt-4">
        <TransportPicker value={mode} onChange={onChangeMode} />
      </div>
    </div>
  )
}
