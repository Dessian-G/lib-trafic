export type TransportMode = 'voiture' | 'clando' | 'bus' | 'moto' | 'pied'

// CLAUDE.md §5.3 : profils ORS par mode (moto approximee en cycling-regular,
// faute de profil deux-roues motorise dans l'API gratuite).
export const TRANSPORT_PROFILES: Record<TransportMode, string> = {
  voiture: 'driving-car',
  clando: 'driving-car',
  bus: 'driving-car',
  moto: 'cycling-regular',
  pied: 'foot-walking',
}

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  voiture: 'Voiture',
  clando: 'Clando',
  bus: 'Bus',
  moto: 'Moto',
  pied: 'À pied',
}

export interface LatLng {
  lat: number
  lng: number
}

export interface OrsRoute {
  distanceMetres: number
  dureeSecondes: number
  geometry: [number, number][] // [lng, lat]
  viaLabel: string | null
}

interface OrsStep {
  name?: string
  distance?: number
}

interface OrsFeature {
  properties: {
    summary: { distance: number; duration: number }
    segments?: { steps?: OrsStep[] }[]
  }
  geometry: { coordinates: [number, number][] }
}

function extraireViaLabel(feature: OrsFeature): string | null {
  const steps = (feature.properties.segments ?? []).flatMap((s) => s.steps ?? [])
  let meilleur: OrsStep | null = null
  for (const step of steps) {
    if (!step.name || step.name === '-') continue
    if (!meilleur || (step.distance ?? 0) > (meilleur.distance ?? 0)) meilleur = step
  }
  return meilleur?.name ?? null
}

export async function calculerItineraire(
  profile: string,
  depart: LatLng,
  arrivee: LatLng,
  options?: { alternatives?: boolean },
): Promise<OrsRoute[]> {
  const apiKey = import.meta.env.VITE_ORS_API_KEY
  if (!apiKey) {
    throw new Error("Clé OpenRouteService manquante — ajoutez VITE_ORS_API_KEY dans .env.local.")
  }

  const body: Record<string, unknown> = {
    coordinates: [
      [depart.lng, depart.lat],
      [arrivee.lng, arrivee.lat],
    ],
    instructions: true,
  }
  if (options?.alternatives) {
    body.alternative_routes = { target_count: 2, weight_factor: 1.6, share_factor: 0.6 }
  }

  const res = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
    method: 'POST',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Erreur OpenRouteService (${res.status})`)
  }

  const data: { features: OrsFeature[] } = await res.json()
  return data.features.map((feature) => ({
    distanceMetres: feature.properties.summary.distance,
    dureeSecondes: feature.properties.summary.duration,
    geometry: feature.geometry.coordinates,
    viaLabel: extraireViaLabel(feature),
  }))
}
