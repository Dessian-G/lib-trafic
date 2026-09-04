import { LockKeyhole, UserRound, WifiOff } from 'lucide-react'

const ARGUMENTS = [
  {
    bg: 'bg-brand-50',
    icon: LockKeyhole,
    title: 'Position utilisée en local',
    text: 'Jamais associée à votre identité.',
  },
  {
    bg: 'bg-accent-50',
    icon: UserRound,
    title: 'Compte anonyme',
    text: 'Aucun numéro, aucun e-mail demandé.',
  },
  {
    bg: 'bg-[#DEEAF3]',
    icon: WifiOff,
    title: 'Léger et hors ligne',
    text: 'La carte reste lisible sans réseau.',
  },
]

interface OnboardingProps {
  onAuthorize: () => void
  onSkip: () => void
}

export default function Onboarding({ onAuthorize, onSkip }: OnboardingProps) {
  return (
    <div className="flex h-dvh flex-col bg-sand-50 px-6 py-10">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-btn bg-brand-600 font-display text-2xl font-bold text-[#F7E7C3]">
          L
        </div>
        <h1 className="font-display text-[34px] font-bold leading-[1.1] tracking-[-0.02em]">
          Le trafic de Libreville, signalé par ceux qui le vivent.
        </h1>
        <p className="text-ink-500">
          Activez votre position pour voir l'état des axes autour de vous et signaler en un
          geste.
        </p>
        <div className="mt-2 flex w-full flex-col gap-4 text-left">
          {ARGUMENTS.map(({ bg, icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <div
                className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full ${bg}`}
              >
                <Icon size={17} className="text-ink-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">{title}</p>
                <p className="text-[13px] text-ink-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onAuthorize}
          className="h-14 rounded-btn bg-brand-600 font-semibold text-white active:bg-brand-700"
        >
          Autoriser ma position
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="h-[52px] text-sm font-semibold text-ink-500"
        >
          Continuer sans géolocalisation
        </button>
      </div>
    </div>
  )
}
