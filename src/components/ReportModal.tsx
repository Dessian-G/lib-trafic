import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { Ban, CarFront, HardHat, ShieldAlert, TriangleAlert, Waves } from 'lucide-react'
import { useEffect, useState, type ComponentType } from 'react'
import { auth, db } from '../firebase'
import { useAuthUid } from '../hooks/useAuthUid'
import type { GeoPosition } from '../hooks/useGeolocation'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { DUREE_PAR_TYPE_MIN, NIVEAU_LABELS, SEVERITE_PAR_DEFAUT, TYPE_LABELS } from '../lib/traffic'
import type { ReportType, Severity } from '../types'

const HAS_REPORTED_KEY = 'libtrafic_has_reported'

const TYPES: { id: ReportType; icon: ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'embouteillage', icon: CarFront },
  { id: 'accident', icon: TriangleAlert },
  { id: 'route_barree', icon: Ban },
  { id: 'travaux', icon: HardHat },
  { id: 'controle_police', icon: ShieldAlert },
  { id: 'inondation', icon: Waves },
]

const THROTTLE_KEY = 'libtrafic_last_report_at'
const THROTTLE_SECONDES = 90
const COMMENT_MAX = 140

interface ReportModalProps {
  open: boolean
  onClose: () => void
  position: GeoPosition | null
  positionLabel: string
  quartierNom?: string
  axeNom?: string
}

export default function ReportModal({
  open,
  onClose,
  position,
  positionLabel,
  quartierNom,
  axeNom,
}: ReportModalProps) {
  const uid = useAuthUid()
  const { online } = useOnlineStatus()
  const [type, setType] = useState<ReportType>('embouteillage')
  const [severity, setSeverity] = useState<Severity>(SEVERITE_PAR_DEFAUT.embouteillage)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!open) return
    const tick = () => {
      const last = Number(localStorage.getItem(THROTTLE_KEY) ?? 0)
      const elapsed = (Date.now() - last) / 1000
      setRemaining(Math.max(0, Math.ceil(THROTTLE_SECONDES - elapsed)))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [open])

  useEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [open])

  if (!open) return null

  const handleSelectType = (t: ReportType) => {
    setType(t)
    setSeverity(SEVERITE_PAR_DEFAUT[t])
  }

  const canSubmit = remaining === 0 && position !== null && !submitting

  const handleSubmit = async () => {
    if (!position) return
    if (!db || !auth || !uid) {
      setErrorMessage('Connexion au serveur indisponible — réessayez plus tard.')
      return
    }
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const dureeMs = DUREE_PAR_TYPE_MIN[type] * 60 * 1000
      const ecriture = addDoc(collection(db, 'reports'), {
        type,
        severity,
        lat: position.lat,
        lng: position.lng,
        authorId: uid,
        confirmations: 0,
        confirmedBy: [],
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromMillis(Date.now() + dureeMs),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
        ...(quartierNom ? { quartier: quartierNom } : {}),
        ...(axeNom ? { axe: axeNom } : {}),
      })

      if (online) {
        await ecriture
      } else {
        // Hors ligne, la promesse Firestore ne se resout qu'au retour du
        // reseau (le SDK rejoue l'ecriture depuis le cache local persistant) :
        // on ne l'attend pas pour eviter de bloquer l'UI indefiniment.
        ecriture.catch((error: unknown) => {
          console.error('Échec différé de synchronisation du signalement :', error)
        })
      }

      localStorage.setItem(THROTTLE_KEY, String(Date.now()))
      localStorage.setItem(HAS_REPORTED_KEY, '1')
      setComment('')
      onClose()
    } catch {
      setErrorMessage("Échec de l'envoi — réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="absolute inset-0 z-20 flex items-end bg-[rgba(16,21,18,.45)]" onClick={onClose}>
      <div
        className={`w-full rounded-t-sheet bg-sand-50 px-6 pb-6 pt-3 transition-transform duration-300 ease-out motion-reduce:transition-none dark:bg-night-800 ${
          entered ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-[5px] w-11 rounded-full bg-sand-300 dark:bg-night-500" />
        <h2 className="text-center font-display text-xl font-bold dark:text-mist-50">
          Que se passe-t-il ?
        </h2>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {TYPES.map(({ id, icon: Icon }) => {
            const isActive = id === type
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectType(id)}
                className={`flex flex-col items-center gap-2 rounded-card border-2 px-3.5 py-2 ${
                  isActive
                    ? 'border-traffic-3 bg-[#FDF0E4] text-[#8A4708] dark:bg-night-700 dark:text-traffic-3-dark'
                    : 'border-transparent bg-sand-100 text-ink-700 dark:bg-night-700 dark:text-mist-200'
                }`}
              >
                <Icon size={22} />
                <span className="text-center text-xs leading-tight">{TYPE_LABELS[id]}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {([1, 2, 3, 4] as Severity[]).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSeverity(n)}
                aria-label={`Gravité ${n}`}
                className={`h-2 w-8 rounded-full ${
                  n <= severity ? 'bg-traffic-3 dark:bg-traffic-3-dark' : 'bg-sand-200 dark:bg-night-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-ink-700 dark:text-mist-200">
            {severity} · {NIVEAU_LABELS[severity]}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-400 dark:text-mist-400">
          Pré-remplie selon le type, ajustable.
        </p>

        <div className="mt-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
            placeholder="Commentaire (facultatif)"
            rows={2}
            className="w-full resize-none rounded-field bg-sand-100 p-3 text-[15px] text-ink-900 outline-none placeholder:text-ink-400 dark:bg-night-700 dark:text-mist-50 dark:placeholder:text-mist-500"
          />
          <p className="mt-1 text-right text-xs text-ink-400 dark:text-mist-400">
            {comment.length} / {COMMENT_MAX}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-field bg-brand-50 px-4 py-3 dark:bg-night-700 dark:ring-1 dark:ring-brand-300/40">
          <span className="text-sm text-ink-700 dark:text-mist-200">{positionLabel}</span>
        </div>
        <p className="mt-1 text-xs text-ink-400 dark:text-mist-400">
          Glissez le marqueur sur la carte pour ajuster la position.
        </p>

        {errorMessage && <p className="mt-3 text-sm text-[#7A1F17] dark:text-[#F2564A]">{errorMessage}</p>}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="mt-4 h-[58px] w-full rounded-btn bg-accent-500 font-bold text-accent-950 disabled:bg-sand-200 disabled:text-ink-300 dark:disabled:bg-night-700 dark:disabled:text-mist-500"
        >
          {remaining > 0
            ? `Publier le signalement (${remaining}s)`
            : submitting
              ? 'Publication…'
              : online
                ? 'Publier le signalement'
                : 'Publier (envoi à la reconnexion)'}
        </button>
      </div>
    </div>
  )
}
