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
  lat: number
  lng: number
  quartier: string
  description: string
  photo?: string
  hours?: string
}
