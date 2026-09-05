import L from 'leaflet'
import { Ban, CarFront, HardHat, ShieldAlert, TriangleAlert, Waves } from 'lucide-react'
import { useEffect, useRef, type ComponentType, type MutableRefObject } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CARTE_CENTRE, CARTE_ZOOM_DEFAUT } from '../data/libreville'
import { useColorScheme, usePrefersReducedMotion } from '../hooks/useColorScheme'
import type { GeoPosition } from '../hooks/useGeolocation'
import { NIVEAU_COULEURS, NIVEAU_COULEURS_SOMBRE } from '../lib/traffic'
import type { Axe, ReportType, Severity, TrafficReport } from '../types'

function createUserIcon(scheme: 'light' | 'dark'): L.DivIcon {
  const color = scheme === 'dark' ? '#4FA3E8' : '#1462A8'
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:22px;height:22px;border-radius:9999px;background:${color};box-shadow:0 0 0 6px rgba(20,98,168,.22)"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

const DRAFT_ICON = L.divIcon({
  className: '',
  html: '<div style="width:34px;height:34px;border-radius:12px 12px 12px 4px;background:#E8A317;box-shadow:0 6px 14px rgba(0,0,0,.25)"></div>',
  iconSize: [34, 34],
  iconAnchor: [8, 32],
})

const TYPE_ICONS: Record<ReportType, ComponentType<{ size?: number; color?: string }>> = {
  embouteillage: CarFront,
  accident: TriangleAlert,
  route_barree: Ban,
  travaux: HardHat,
  controle_police: ShieldAlert,
  inondation: Waves,
  fluide: CarFront,
}

const PROCHE_EXPIRATION_MS = 10 * 60 * 1000

function createReportIcon(report: TrafficReport, scheme: 'light' | 'dark'): L.DivIcon {
  const Icon = TYPE_ICONS[report.type]
  const svg = renderToStaticMarkup(<Icon size={18} color="#fff" />)
  const opacity = report.expiresAt.toMillis() - Date.now() <= PROCHE_EXPIRATION_MS ? 0.6 : 1
  const couleurs = scheme === 'dark' ? NIVEAU_COULEURS_SOMBRE : NIVEAU_COULEURS
  return L.divIcon({
    className: '',
    html: `<div style="width:38px;height:38px;border-radius:12px 12px 12px 4px;background:${couleurs[report.severity]};display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(0,0,0,.25);opacity:${opacity}">${svg}</div>`,
    iconSize: [38, 38],
    iconAnchor: [8, 36],
  })
}

function niveauLargeur(zoom: number): number {
  return zoom >= 14 ? 9 : 6
}

export interface MapViewHandle {
  flyTo: (position: GeoPosition, zoom?: number) => void
}

interface AxeAvecNiveau {
  axe: Axe
  niveau: Severity | null
}

interface MapViewProps {
  userPosition: GeoPosition | null
  recenterSignal: number
  mapRef: MutableRefObject<MapViewHandle | null>
  reports: TrafficReport[]
  onSelectReport: (report: TrafficReport) => void
  axesAvecNiveau: AxeAvecNiveau[]
  draftPosition: GeoPosition | null
  onDraftPositionChange: (position: GeoPosition) => void
  offline?: boolean
}

export default function MapView({
  userPosition,
  recenterSignal,
  mapRef,
  reports,
  onSelectReport,
  axesAvecNiveau,
  draftPosition,
  onDraftPositionChange,
  offline,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const draftMarkerRef = useRef<L.Marker | null>(null)
  const reportMarkersRef = useRef<Map<string, L.Marker>>(new Map())
  const polylinesRef = useRef<Map<string, L.Polyline>>(new Map())
  const onSelectReportRef = useRef(onSelectReport)
  const onDraftPositionChangeRef = useRef(onDraftPositionChange)
  onSelectReportRef.current = onSelectReport
  onDraftPositionChangeRef.current = onDraftPositionChange

  const scheme = useColorScheme()
  const reducedMotion = usePrefersReducedMotion()
  const schemeRef = useRef(scheme)
  const reducedMotionRef = useRef(reducedMotion)
  schemeRef.current = scheme
  reducedMotionRef.current = reducedMotion

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
        const targetZoom = zoom ?? Math.max(map.getZoom(), 14)
        if (reducedMotionRef.current) {
          map.setView([position.lat, position.lng], targetZoom)
        } else {
          map.flyTo([position.lat, position.lng], targetZoom)
        }
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
        icon: createUserIcon(scheme),
        zIndexOffset: 1000,
      }).addTo(map)
    } else {
      userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng])
      userMarkerRef.current.setIcon(createUserIcon(scheme))
    }
  }, [userPosition, scheme])

  useEffect(() => {
    if (recenterSignal === 0) return
    const map = leafletMapRef.current
    if (map && userPosition) {
      const targetZoom = Math.max(map.getZoom(), 14)
      if (reducedMotion) {
        map.setView([userPosition.lat, userPosition.lng], targetZoom)
      } else {
        map.flyTo([userPosition.lat, userPosition.lng], targetZoom)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterSignal])

  // Marqueurs de signalements : synchronise la Map Leaflet avec `reports`.
  useEffect(() => {
    const map = leafletMapRef.current
    if (!map) return
    const current = reportMarkersRef.current
    const idsVus = new Set<string>()

    for (const report of reports) {
      idsVus.add(report.id)
      const existant = current.get(report.id)
      if (existant) {
        existant.setLatLng([report.lat, report.lng])
        existant.setIcon(createReportIcon(report, scheme))
      } else {
        const marker = L.marker([report.lat, report.lng], { icon: createReportIcon(report, scheme) })
        marker.on('click', () => onSelectReportRef.current(report))
        marker.addTo(map)
        current.set(report.id, marker)
      }
    }

    for (const [id, marker] of current) {
      if (!idsVus.has(id)) {
        marker.remove()
        current.delete(id)
      }
    }
  }, [reports, scheme])

  // Axes colores selon le niveau de trafic agrege (CLAUDE.md §6).
  useEffect(() => {
    const map = leafletMapRef.current
    if (!map) return
    const current = polylinesRef.current
    const idsVus = new Set<string>()
    const weight = niveauLargeur(map.getZoom())
    // DESIGN.md §5.7 : axes a 55% d'opacite hors ligne (donnees potentiellement perimees).
    const opacity = offline ? 0.55 : 0.9
    const couleurs = scheme === 'dark' ? NIVEAU_COULEURS_SOMBRE : NIVEAU_COULEURS

    for (const { axe, niveau } of axesAvecNiveau) {
      const points = axe.path.filter(
        (p): p is { name: string; lat: number; lng: number } => p.lat !== null && p.lng !== null,
      )
      if (niveau === null || points.length < 2) continue
      idsVus.add(axe.id)
      const latlngs = points.map((p): [number, number] => [p.lat, p.lng])
      const existant = current.get(axe.id)
      if (existant) {
        existant.setLatLngs(latlngs)
        existant.setStyle({ color: couleurs[niveau], weight, opacity })
      } else {
        const polyline = L.polyline(latlngs, {
          color: couleurs[niveau],
          weight,
          opacity,
          lineCap: 'round',
        }).addTo(map)
        current.set(axe.id, polyline)
      }
    }

    for (const [id, polyline] of current) {
      if (!idsVus.has(id)) {
        polyline.remove()
        current.delete(id)
      }
    }
  }, [axesAvecNiveau, offline, scheme])

  useEffect(() => {
    const map = leafletMapRef.current
    if (!map) return

    if (!draftPosition) {
      draftMarkerRef.current?.remove()
      draftMarkerRef.current = null
      return
    }

    if (!draftMarkerRef.current) {
      const marker = L.marker([draftPosition.lat, draftPosition.lng], {
        icon: DRAFT_ICON,
        draggable: true,
        zIndexOffset: 2000,
      })
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng()
        onDraftPositionChangeRef.current({ lat, lng })
      })
      marker.addTo(map)
      draftMarkerRef.current = marker
    } else {
      draftMarkerRef.current.setLatLng([draftPosition.lat, draftPosition.lng])
    }
  }, [draftPosition])

  // isolate : Leaflet pose ses panes internes a des z-index allant jusqu'a
  // 700 ; sans nouveau contexte d'empilement ici, ils passeraient au-dessus
  // des superpositions (recherche, feuilles) malgre leurs z-index plus bas.
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 isolate"
      style={offline ? { filter: 'saturate(.5)' } : undefined}
    />
  )
}
