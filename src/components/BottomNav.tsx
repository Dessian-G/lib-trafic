import { Landmark, Map, Route } from 'lucide-react'

export type TabId = 'carte' | 'itineraire' | 'sites'

const TABS: { id: TabId; label: string; icon: typeof Map }[] = [
  { id: 'carte', label: 'Carte', icon: Map },
  { id: 'itineraire', label: 'Itinéraire', icon: Route },
  { id: 'sites', label: 'Sites', icon: Landmark },
]

interface BottomNavProps {
  active: TabId
  onChange: (tab: TabId) => void
  offline?: boolean
}

export default function BottomNav({ active, onChange, offline }: BottomNavProps) {
  return (
    <nav
      className="flex shrink-0 items-stretch border-t border-sand-200 bg-sand-50 pb-[env(safe-area-inset-bottom)] dark:border-night-600 dark:bg-night-900"
      style={{ height: 'calc(94px + env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active
        // L'itineraire exige le reseau (ORS) : desactive hors ligne (DESIGN.md §5.7).
        const isDisabled = offline && id === 'itineraire'
        const color = isDisabled
          ? 'text-ink-300 dark:text-mist-500'
          : isActive
            ? 'text-brand-600 dark:text-brand-300'
            : 'text-ink-400 dark:text-mist-400'
        return (
          <button
            key={id}
            type="button"
            onClick={() => !isDisabled && onChange(id)}
            disabled={isDisabled}
            className="flex flex-1 flex-col items-center justify-center gap-1"
          >
            <Icon size={22} className={color} />
            <span className={`text-[11px] font-semibold ${color}`}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
