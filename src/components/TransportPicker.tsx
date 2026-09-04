import { Bus, Car, CarTaxiFront, Footprints, Motorbike, type LucideIcon } from 'lucide-react'
import { TRANSPORT_LABELS, type TransportMode } from '../lib/ors'

const ICONES: Record<TransportMode, LucideIcon> = {
  voiture: Car,
  clando: CarTaxiFront,
  bus: Bus,
  moto: Motorbike,
  pied: Footprints,
}

const MODES: TransportMode[] = ['voiture', 'clando', 'bus', 'moto', 'pied']

interface TransportPickerProps {
  value: TransportMode
  onChange: (mode: TransportMode) => void
}

export default function TransportPicker({ value, onChange }: TransportPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {MODES.map((mode) => {
        const Icon = ICONES[mode]
        const isActive = mode === value
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={`flex h-[66px] flex-col items-center justify-center gap-1 rounded-card ${
              isActive ? 'bg-brand-600 text-white' : 'bg-sand-100 text-ink-600'
            }`}
          >
            <Icon size={19} />
            <span className="text-[11px] font-semibold">{TRANSPORT_LABELS[mode]}</span>
          </button>
        )
      })}
    </div>
  )
}
