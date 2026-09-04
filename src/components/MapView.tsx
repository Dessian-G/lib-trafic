import L from 'leaflet'
import { useEffect, useRef, type MutableRefObject } from 'react'
import { CARTE_CENTRE, CARTE_ZOOM_DEFAUT } from '../data/libreville'
import type { GeoPosition } from '../hooks/useGeolocation'

const USER_ICON = L.divIcon({
  className: '',
  html: '<span style="display:block;width:22px;height:22px;border-radius:9999px;background:#1462A8;box-shadow:0 0 0 6px rgba(20,98,168,.22)"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

export interface MapViewHandle {
  flyTo: (position: GeoPosition, zoom?: number) => void
}

interface MapViewProps {
  userPosition: GeoPosition | null
  recenterSignal: number
  mapRef: MutableRefObject<MapViewHandle | null>
}

export default function MapView({ userPosition, recenterSignal, mapRef }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || leafletMapRef.current) return

    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView(
      [CARTE_CENTRE.lat, CARTE_CENTRE.lng],
      CARTE_ZOOM_DEFAUT,
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map)

    leafletMapRef.current = map
    mapRef.current = {
      flyTo: (position, zoom) => {
        map.flyTo([position.lat, position.lng], zoom ?? Math.max(map.getZoom(), 14))
      },
    }

    return () => {
      map.remove()
      leafletMapRef.current = null
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = leafletMapRef.current
    if (!map || !userPosition) return

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], {
        icon: USER_ICON,
        zIndexOffset: 1000,
      }).addTo(map)
    } else {
      userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng])
    }
  }, [userPosition])

  useEffect(() => {
    if (recenterSignal === 0) return
    const map = leafletMapRef.current
    if (map && userPosition) {
      map.flyTo([userPosition.lat, userPosition.lng], Math.max(map.getZoom(), 14))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterSignal])

  return <div ref={containerRef} className="absolute inset-0" />
}
