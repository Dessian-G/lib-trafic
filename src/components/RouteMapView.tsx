import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { CARTE_CENTRE, CARTE_ZOOM_DEFAUT } from '../data/libreville'
import type { LatLng, OrsRoute } from '../lib/ors'

const DEPART_ICON = L.divIcon({
  className: '',
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#1462A8;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const ARRIVEE_ICON = L.divIcon({
  className: '',
  html: '<div style="width:30px;height:30px;border-radius:12px 12px 12px 4px;background:#E8A317;box-shadow:0 6px 14px rgba(0,0,0,.25)"></div>',
  iconSize: [30, 30],
  iconAnchor: [6, 28],
})

interface RouteMapViewProps {
  depart: LatLng | null
  arrivee: LatLng | null
  recommande: OrsRoute | null
  alternative: OrsRoute | null
}

export default function RouteMapView({ depart, arrivee, recommande, alternative }: RouteMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const departMarkerRef = useRef<L.Marker | null>(null)
  const arriveeMarkerRef = useRef<L.Marker | null>(null)
  const recommandeLineRef = useRef<L.Polyline | null>(null)
  const alternativeLineRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView(
      [CARTE_CENTRE.lat, CARTE_CENTRE.lng],
      CARTE_ZOOM_DEFAUT,
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (depart) {
      if (!departMarkerRef.current) {
        departMarkerRef.current = L.marker([depart.lat, depart.lng], { icon: DEPART_ICON }).addTo(map)
      } else {
        departMarkerRef.current.setLatLng([depart.lat, depart.lng])
      }
    } else {
      departMarkerRef.current?.remove()
      departMarkerRef.current = null
    }

    if (arrivee) {
      if (!arriveeMarkerRef.current) {
        arriveeMarkerRef.current = L.marker([arrivee.lat, arrivee.lng], { icon: ARRIVEE_ICON }).addTo(map)
      } else {
        arriveeMarkerRef.current.setLatLng([arrivee.lat, arrivee.lng])
      }
    } else {
      arriveeMarkerRef.current?.remove()
      arriveeMarkerRef.current = null
    }

    alternativeLineRef.current?.remove()
    alternativeLineRef.current = alternative
      ? L.polyline(
          alternative.geometry.map(([lng, lat]): [number, number] => [lat, lng]),
          { color: '#DDD5C6', weight: 8, lineCap: 'round' },
        ).addTo(map)
      : null

    recommandeLineRef.current?.remove()
    recommandeLineRef.current = recommande
      ? L.polyline(
          recommande.geometry.map(([lng, lat]): [number, number] => [lat, lng]),
          { color: '#1462A8', weight: 11, lineCap: 'round' },
        ).addTo(map)
      : null

    const bounds: L.LatLngExpression[] = []
    if (depart) bounds.push([depart.lat, depart.lng])
    if (arrivee) bounds.push([arrivee.lat, arrivee.lng])
    if (recommande) bounds.push(...recommande.geometry.map(([lng, lat]): [number, number] => [lat, lng]))
    if (bounds.length >= 2) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] })
    } else if (bounds.length === 1) {
      map.setView(bounds[0] as L.LatLngTuple, 14)
    }
  }, [depart, arrivee, recommande, alternative])

  return <div ref={containerRef} className="absolute inset-0 isolate" />
}
