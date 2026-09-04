import { useEffect, useState } from 'react'

interface OfflineBannerProps {
  offlineSince: number | null
}

function formatMinutes(offlineSince: number, now: number): number {
  return Math.max(0, Math.floor((now - offlineSince) / 60000))
}

export default function OfflineBanner({ offlineSince }: OfflineBannerProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(interval)
  }, [])

  if (offlineSince === null) return null

  const minutes = formatMinutes(offlineSince, now)
  const depuis = minutes < 1 ? "à l'instant" : `il y a ${minutes} min`

  return (
    <div className="shrink-0 bg-[#3B3226] px-[22px] py-2 text-center text-xs">
      <span className="font-semibold text-[#F7E7C3]">Vous êtes hors ligne — </span>
      <span className="text-[#C6BCA8]">
        Carte et signalements affichés depuis le cache, dernière mise à jour {depuis}. Ils peuvent
        être périmés.
      </span>
    </div>
  )
}
