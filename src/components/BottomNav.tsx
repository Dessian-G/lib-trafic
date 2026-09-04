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
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="flex shrink-0 items-stretch border-t border-sand-200 bg-sand-50 pb-[env(safe-area-inset-bottom)]"
      style={{ height: 'calc(94px + env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="flex flex-1 flex-col items-center justify-center gap-1"
          >
            <Icon size={22} className={isActive ? 'text-brand-600' : 'text-ink-400'} />
            <span
              className={`text-[11px] font-semibold ${isActive ? 'text-brand-600' : 'text-ink-400'}`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
