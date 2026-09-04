import { useCallback, useEffect, useRef, useState } from 'react'

export type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'

export interface GeoPosition {
  lat: number
  lng: number
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const requestPosition = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      setError("La géolocalisation n'est pas disponible sur cet appareil.")
      return
    }
    setStatus('loading')
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('granted')
        setError(null)
      },
      (err) => {
        setStatus('denied')
        setError(err.message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    )
  }, [])

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return { position, status, error, requestPosition }
}
