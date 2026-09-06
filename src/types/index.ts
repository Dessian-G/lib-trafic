import type { Timestamp } from 'firebase/firestore'

export type ReportType =
  | 'embouteillage'
  | 'accident'
  | 'route_barree'
  | 'travaux'
  | 'controle_police'
  | 'inondation'
  | 'fluide'

export type Severity = 1 | 2 | 3 | 4

export interface TrafficReport {
  id: string
  type: ReportType
  severity: Severity
  lat: number
  lng: number
  quartier?: string
  axe?: string
  comment?: string
  authorId: string
  confirmations: number
  // Non prevu explicitement par CLAUDE.md §4 mais necessaire pour respecter
  // la regle DESIGN.md §5.4 "un seul vote par uid" sur Oui/dégagé.
  confirmedBy: string[]
  createdAt: Timestamp
  expiresAt: Timestamp
}

export interface UserProfile {
  uid: string
  displayName?: string
  reportsCount: number
  createdAt: Timestamp
}

export type TouristCategory =
  | 'religieux'
  | 'culturel'
  | 'marche'
  | 'nature'
  | 'plage'
  | 'monument'

export interface TouristSite {
  id: string
  name: string
  category: TouristCategory
  lat: number | null // null tant que la coordonnee n'est pas verifiee (TODO)
  lng: number | null
  quartier: string | null
  description: string
  photo?: string
  hours?: string
  source: string | null
}

export type Commune = 'Libreville' | 'Owendo' | 'Akanda' | 'Ntoum'

// Quartier ou carrefour/point chaud (CLAUDE.md §7) : meme forme, discriminee
// par `type`, pour rester dans le seul fichier public/data/quartiers.json
// prevu par la structure du depot (§3).
export interface Repere {
  id: string
  name: string
  type: 'quartier' | 'carrefour'
  commune: Commune | null
  lat: number | null
  lng: number | null
  source: string | null
}

export interface AxePoint {
  name: string
  lat: number | null
  lng: number | null
}

export interface Axe {
  id: string
  name: string
  path: AxePoint[]
  note?: string
}

export interface BusLine {
  id: string
  operator: 'Sogatra' | "Trans'Urb" | 'Trans Akanda'
  name?: string
  stops: string[]
  note?: string
}

// Seule Libreville dispose d'une frontiere administrative cartographiee dans
// OpenStreetMap (relation admin_level 6) ; Owendo/Akanda/Ntoum n'y ont pas de
// polygone de commune — `boundary` reste alors `null` plutot que d'inventer
// un trace, et seul le centre (point verifie) est disponible.
export interface CommuneZone {
  id: string
  name: string
  color: string
  boundary: { lat: number; lng: number }[] | null
  center: { lat: number; lng: number }
  source: string
}
