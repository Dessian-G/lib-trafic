import { Plus } from 'lucide-react'

interface ReportButtonProps {
  onClick: () => void
  disabled?: boolean
  offline?: boolean
}

export default function ReportButton({ onClick, disabled, offline }: ReportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        offline
          ? 'flex h-14 items-center gap-1.5 rounded-btn bg-sand-200 px-5 font-semibold text-ink-300'
          : 'flex h-14 items-center gap-1.5 rounded-btn bg-accent-500 px-5 font-semibold text-accent-950 shadow-[0_10px_24px_rgba(232,163,23,.4)] disabled:bg-sand-200 disabled:text-ink-300 disabled:shadow-none'
      }
    >
      <Plus size={20} strokeWidth={2.5} />
      {offline ? 'Envoi à la reconnexion' : 'Signaler'}
    </button>
  )
}
