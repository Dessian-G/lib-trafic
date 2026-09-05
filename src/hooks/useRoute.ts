import { useEffect, useState } from 'react'
import { calculerItineraire, type LatLng, type OrsRoute } from '../lib/ors'

interface UseRouteResult {
  routes: OrsRoute[]
  loading: boolean
  error: string | null
  retry: () => void
}

export function useRoute(
  profile: string,
  depart: LatLng | null,
  arrivee: LatLng | null,
  alternatives: boolean,
): UseRouteResult {
  const [routes, setRoutes] = useState<OrsRoute[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!depart || !arrivee) {
      setRoutes([])
      setError(null)
      return
    }

    let annule = false
    setLoading(true)
    setError(null)

    calculerItineraire(profile, depart, arrivee, { alternatives })
      .then((res) => {
        if (!annule) setRoutes(res)
      })
      .catch((err: unknown) => {
        if (!annule) {
          setRoutes([])
          setError(err instanceof Error ? err.message : 'Erreur inconnue')
        }
      })
      .finally(() => {
        if (!annule) setLoading(false)
      })

    return () => {
      annule = true
    }
  }, [profile, depart?.lat, depart?.lng, arrivee?.lat, arrivee?.lng, alternatives, retryCount])

  return { routes, loading, error, retry: () => setRetryCount((n) => n + 1) }
}
