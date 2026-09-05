import type { Axe, ReportType, Severity, TrafficReport } from '../types'
import { distancePointPolylineMetres } from './geo'

// Durees explicitement donnees par CLAUDE.md §5.2 (accident/embouteillage/
// travaux) ; les autres types n'ont pas de duree specifiee dans le cahier
// des charges ("ex :") — valeurs par defaut raisonnables, ajustables.
export const DUREE_PAR_TYPE_MIN: Record<ReportType, number> = {
  embouteillage: 45,
  accident: 60,
  route_barree: 120,
  travaux: 8 * 60,
  controle_police: 30,
  inondation: 180,
  fluide: 20,
}

export const SEVERITE_PAR_DEFAUT: Record<ReportType, Severity> = {
  embouteillage: 2,
  accident: 4,
  route_barree: 4,
  travaux: 2,
  controle_police: 2,
  inondation: 4,
  fluide: 1,
}

export const TYPE_LABELS: Record<ReportType, string> = {
  embouteillage: 'Embouteillage',
  accident: 'Accident',
  route_barree: 'Route barrée',
  travaux: 'Travaux',
  controle_police: 'Contrôle police',
  inondation: 'Inondation',
  fluide: 'Fluide',
}

export const NIVEAU_LABELS: Record<Severity, string> = {
  1: 'Fluide',
  2: 'Dense',
  3: 'Chargé',
  4: 'Bloqué',
}

export const NIVEAU_COULEURS: Record<Severity, string> = {
  1: '#2FA84F',
  2: '#F2C230',
  3: '#F07C1E',
  4: '#DC3B2F',
}

// DESIGN.md §2 : variante sombre des couleurs de trafic. Utilisee pour les
// elements rendus par Leaflet (marqueurs/polylines en style inline), qui ne
// peuvent pas profiter des variantes `dark:` de Tailwind.
export const NIVEAU_COULEURS_SOMBRE: Record<Severity, string> = {
  1: '#46C46A',
  2: '#FFD34F',
  3: '#FF9440',
  4: '#F2564A',
}

const RAYON_AXE_METRES = 300
const SEUIL_PROCHE_EXPIRATION_MIN = 10

export function estActif(report: TrafficReport): boolean {
  return report.expiresAt.toMillis() > Date.now()
}

export function estProcheExpiration(report: TrafficReport): boolean {
  return report.expiresAt.toMillis() - Date.now() <= SEUIL_PROCHE_EXPIRATION_MIN * 60 * 1000
}

// Niveau d'un axe = max des gravites des signalements actifs a moins de
// 300 m du trace (CLAUDE.md §6). La ponderation par confirmations/anciennete
// evoquee dans le meme paragraphe n'est pas chiffree par le cahier des
// charges ; laissee en l'etat (max simple) plutot que d'inventer une formule.
export function niveauAxe(axe: Axe, reports: TrafficReport[]): Severity | null {
  let niveau: Severity | null = null
  for (const report of reports) {
    const distance = distancePointPolylineMetres({ lat: report.lat, lng: report.lng }, axe.path)
    if (distance !== null && distance <= RAYON_AXE_METRES) {
      if (niveau === null || report.severity > niveau) niveau = report.severity
    }
  }
  return niveau
}

export interface AxeAvecNiveau {
  axe: Axe
  niveau: Severity | null
}

const SEUIL_CROISEMENT_AXE_METRES = 120

// Premier axe de niveau 4 (bloque) que le trace d'un itineraire recoupe,
// pour l'avertissement de RoutePage (CLAUDE.md §5.3).
export function axeBloqueTraverse(
  geometrieLngLat: [number, number][],
  axesAvecNiveau: AxeAvecNiveau[],
): Axe | null {
  const bloques = axesAvecNiveau.filter((a) => a.niveau === 4)
  if (bloques.length === 0) return null
  for (const [lng, lat] of geometrieLngLat) {
    for (const { axe } of bloques) {
      const distance = distancePointPolylineMetres({ lat, lng }, axe.path)
      if (distance !== null && distance <= SEUIL_CROISEMENT_AXE_METRES) return axe
    }
  }
  return null
}
