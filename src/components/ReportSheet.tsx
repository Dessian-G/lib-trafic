import { arrayUnion, doc, increment, Timestamp, updateDoc } from 'firebase/firestore'
import { Ban, CarFront, HardHat, ShieldAlert, TriangleAlert, Waves } from 'lucide-react'
import { useState, type ComponentType } from 'react'
import { db } from '../firebase'
import { DUREE_PAR_TYPE_MIN, NIVEAU_COULEURS, TYPE_LABELS } from '../lib/traffic'
import type { ReportType, TrafficReport } from '../types'

const TYPE_ICONS: Record<ReportType, ComponentType<{ size?: number; color?: string }>> = {
  embouteillage: CarFront,
  accident: TriangleAlert,
  route_barree: Ban,
  travaux: HardHat,
  controle_police: ShieldAlert,
  inondation: Waves,
  fluide: CarFront,
}

function formatRelative(ms: number): string {
  const minutes = Math.round(ms / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  return `il y a ${Math.round(minutes / 60)} h`
}

function formatDelai(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60000))
  if (minutes < 60) return `dans ${minutes} min`
  return `dans ${Math.round(minutes / 60)} h`
}

interface ReportSheetProps {
  report: TrafficReport
  uid: string | null
  onClose: () => void
  onAvoidRoute: () => void
}

export default function ReportSheet({ report, uid, onClose, onAvoidRoute }: ReportSheetProps) {
  const [pending, setPending] = useState(false)
  const dejaVote = uid !== null && report.confirmedBy.includes(uid)
  const Icon = TYPE_ICONS[report.type]

  const vote = async (confirmer: boolean) => {
    if (!db || !uid || dejaVote || pending) return
    setPending(true)
    try {
      const ref = doc(db, 'reports', report.id)
      const dureeMs = DUREE_PAR_TYPE_MIN[report.type] * 60 * 1000
      if (confirmer) {
        await updateDoc(ref, {
          confirmations: increment(1),
          confirmedBy: arrayUnion(uid),
          expiresAt: Timestamp.fromMillis(Date.now() + dureeMs),
        })
      } else {
        await updateDoc(ref, {
          confirmedBy: arrayUnion(uid),
          expiresAt: Timestamp.now(),
        })
      }
      onClose()
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="absolute inset-0 z-20 flex items-end bg-[rgba(16,21,18,.45)]" onClick={onClose}>
      <div
        className="w-full rounded-t-sheet bg-sand-50 px-6 pb-6 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-[5px] w-11 rounded-full bg-sand-300" />

        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card"
            style={{ backgroundColor: NIVEAU_COULEURS[report.severity] }}
          >
            <Icon size={22} color="#fff" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold">{TYPE_LABELS[report.type]}</h2>
            {(report.axe || report.quartier) && (
              <p className="truncate text-sm text-ink-500">
                {[report.axe, report.quartier].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-[#FBE4E2] px-3 py-1 text-xs font-semibold text-[#A5251B]">
            Niveau {report.severity}
          </span>
        </div>

        {report.comment && (
          <p className="mt-4 rounded-field bg-sand-100 p-3 text-sm text-ink-700">
            {report.comment}
          </p>
        )}

        <div className="mt-4 flex justify-between text-center">
          <div>
            <p className="text-xs text-ink-400">Signalé</p>
            <p className="text-[15px] font-bold text-ink-900">
              {formatRelative(Date.now() - report.createdAt.toMillis())}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400">Expire</p>
            <p className="text-[15px] font-bold text-ink-900">
              {formatDelai(report.expiresAt.toMillis() - Date.now())}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400">Confirmé par</p>
            <p className="text-[15px] font-bold text-ink-900">{report.confirmations}</p>
          </div>
        </div>

        <p className="mt-5 text-sm font-semibold text-ink-900">Toujours là ?</p>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            disabled={dejaVote || pending || !uid}
            onClick={() => vote(true)}
            className="h-[54px] flex-1 rounded-btn bg-brand-600 font-semibold text-white disabled:bg-sand-200 disabled:text-ink-300"
          >
            Oui, toujours
          </button>
          <button
            type="button"
            disabled={dejaVote || pending || !uid}
            onClick={() => vote(false)}
            className="h-[54px] flex-1 rounded-btn border border-sand-300 font-semibold text-ink-700 disabled:text-ink-300"
          >
            C'est dégagé
          </button>
        </div>
        {dejaVote && <p className="mt-2 text-center text-xs text-ink-400">Vous avez déjà voté.</p>}

        <button
          type="button"
          onClick={() => {
            onAvoidRoute()
            onClose()
          }}
          className="mt-4 w-full text-center text-sm font-semibold text-ocean-600"
        >
          Recalculer mon itinéraire en évitant ce point
        </button>
      </div>
    </div>
  )
}
