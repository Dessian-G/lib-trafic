import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const LAUNCH_COUNT_KEY = 'libtrafic_launch_count'
const SESSION_COUNTED_KEY = 'libtrafic_session_counted'
const DISMISSED_AT_KEY = 'libtrafic_install_dismissed_at'
const HAS_REPORTED_KEY = 'libtrafic_has_reported'
const DISMISS_SILENCE_MS = 14 * 24 * 60 * 60 * 1000

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function incrementerLancements(): number {
  if (sessionStorage.getItem(SESSION_COUNTED_KEY)) {
    return Number(localStorage.getItem(LAUNCH_COUNT_KEY) ?? 0)
  }
  sessionStorage.setItem(SESSION_COUNTED_KEY, '1')
  const count = Number(localStorage.getItem(LAUNCH_COUNT_KEY) ?? 0) + 1
  localStorage.setItem(LAUNCH_COUNT_KEY, String(count))
  return count
}

function recemmentIgnore(): boolean {
  const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) ?? 0)
  return Date.now() - dismissedAt < DISMISS_SILENCE_MS
}

export default function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dejaInstallee = window.matchMedia('(display-mode: standalone)').matches
    if (dejaInstallee) return

    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredEvent(event as BeforeInstallPromptEvent)

      const lancements = incrementerLancements()
      const aSignale = localStorage.getItem(HAS_REPORTED_KEY) === '1'
      if ((lancements >= 2 || aSignale) && !recemmentIgnore()) {
        setVisible(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !deferredEvent) return null

  const handleInstaller = async () => {
    setVisible(false)
    await deferredEvent.prompt()
  }

  const handlePlusTard = () => {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()))
    setVisible(false)
  }

  return (
    <div className="absolute inset-x-[18px] bottom-[calc(94px+env(safe-area-inset-bottom)+14px)] z-30 rounded-[22px] bg-brand-600 p-4 shadow-[0_16px_40px_rgba(14,107,69,.35)]">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-[rgba(247,231,195,.15)]">
          <Download size={22} className="text-[#F7E7C3]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-white">Installer Lib'Trafic</p>
          <p className="mt-0.5 text-[13px] text-[#DCEAE0]">
            Ouverture instantanée depuis l'écran d'accueil, moins de données consommées.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePlusTard}
          aria-label="Fermer"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-[#DCEAE0]"
        >
          <X size={18} />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleInstaller}
          className="h-[50px] flex-1 rounded-btn bg-accent-500 font-semibold text-accent-950"
        >
          Installer
        </button>
        <button
          type="button"
          onClick={handlePlusTard}
          className="h-[50px] flex-1 rounded-btn bg-[rgba(255,255,255,.12)] font-semibold text-white"
        >
          Plus tard
        </button>
      </div>
    </div>
  )
}
