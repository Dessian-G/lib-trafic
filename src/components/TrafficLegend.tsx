const NIVEAUX = [
  { color: 'bg-traffic-1 dark:bg-traffic-1-dark', label: 'Fluide' },
  { color: 'bg-traffic-2 dark:bg-traffic-2-dark', label: 'Dense' },
  { color: 'bg-traffic-3 dark:bg-traffic-3-dark', label: 'Chargé' },
  { color: 'bg-traffic-4 dark:bg-traffic-4-dark', label: 'Bloqué' },
]

export default function TrafficLegend() {
  return (
    <div className="rounded-card bg-[rgba(251,247,240,.94)] px-3 py-2 shadow-[0_6px_20px_rgba(22,33,28,.14)] dark:bg-[rgba(25,32,28,.9)]">
      <p className="text-[11px] font-bold uppercase tracking-[.08em] text-ink-400 dark:text-mist-400">
        Trafic
      </p>
      <ul className="mt-1 flex flex-col gap-1">
        {NIVEAUX.map(({ color, label }) => (
          <li key={label} className="flex items-center gap-2">
            <span className={`h-[5px] w-[14px] rounded-full ${color}`} />
            <span className="text-xs font-semibold text-ink-700 dark:text-mist-200">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
