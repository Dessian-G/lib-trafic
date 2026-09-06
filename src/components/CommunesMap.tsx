import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { CARTE_CENTRE } from '../data/libreville'
import { useColorScheme } from '../hooks/useColorScheme'
import type { CommuneZone } from '../types'

function createLabelIcon(name: string, scheme: 'light' | 'dark'): L.DivIcon {
  const bg = scheme === 'dark' ? 'rgba(25,32,28,.85)' : 'rgba(251,247,240,.9)'
  const color = scheme === 'dark' ? '#E7EDE8' : '#16211C'
  return L.divIcon({
    className: '',
    html: `<span style="display:inline-block;white-space:nowrap;transform:translate(-50%,-50%);padding:2px 8px;border-radius:999px;background:${bg};color:${color};font-size:12px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,.2)">${name}</span>`,
    iconSize: [0, 0],
  })
}

interface CommunesMapProps {
  communes: CommuneZone[]
}

export default function CommunesMap({ communes }: CommunesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layersRef = useRef<L.Layer[]>([])
  const scheme = useColorScheme()

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView(
      [CARTE_CENTRE.lat, CARTE_CENTRE.lng],
      10,
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
    if (!map || communes.length === 0) return

    for (const layer of layersRef.current) layer.remove()
    layersRef.current = []

    const bounds: L.LatLngExpression[] = []

    for (const commune of communes) {
      if (commune.boundary && commune.boundary.length >= 3) {
        const latlngs = commune.boundary.map((p): [number, number] => [p.lat, p.lng])
        const polygon = L.polygon(latlngs, {
          color: commune.color,
          weight: 2,
          fillColor: commune.color,
          fillOpacity: scheme === 'dark' ? 0.35 : 0.22,
        }).addTo(map)
        layersRef.current.push(polygon)
        bounds.push(...latlngs)
      } else {
        const marker = L.circleMarker([commune.center.lat, commune.center.lng], {
          radius: 9,
          color: '#fff',
          weight: 2,
          fillColor: commune.color,
          fillOpacity: 1,
        }).addTo(map)
        layersRef.current.push(marker)
        bounds.push([commune.center.lat, commune.center.lng])
      }

      const label = L.marker([commune.center.lat, commune.center.lng], {
        icon: createLabelIcon(commune.name, scheme),
        interactive: false,
      }).addTo(map)
      layersRef.current.push(label)
    }

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30] })
    }
  }, [communes, scheme])

  return <div ref={containerRef} className="absolute inset-0 isolate" />
}
