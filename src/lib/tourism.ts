import type { TouristCategory } from '../types'

export const CATEGORY_LABELS: Record<TouristCategory, string> = {
  religieux: 'Religieux',
  culturel: 'Culturel',
  marche: 'Marché',
  nature: 'Nature',
  plage: 'Plage',
  monument: 'Monument',
}

// Pas de vraies photos sourcees (CLAUDE.md interdit d'inventer des donnees) ;
// couleur de secours par categorie pour la bannière, en attendant de vrais
// visuels WebP ≤ 60 ko (DESIGN.md §1).
export const CATEGORY_COLORS: Record<TouristCategory, string> = {
  religieux: '#8B5E3C',
  culturel: '#6B4FA0',
  marche: '#C2571B',
  nature: '#2E7D4F',
  plage: '#1462A8',
  monument: '#5B655E',
}
