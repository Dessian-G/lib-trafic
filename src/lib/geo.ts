import type { Axe, AxePoint } from '../types'

export interface LatLng {
  lat: number
  lng: number
}

const EARTH_RADIUS_M = 6371000

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function distanceMetres(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(Math.min(1, h)))
}

// Projection equirectangulaire locale (suffisante a l'echelle du Grand
// Libreville) pour ramener le calcul point-segment a de la geometrie plane.
function toLocalXY(point: LatLng, origin: LatLng) {
  const x = toRad(point.lng - origin.lng) * Math.cos(toRad(origin.lat)) * EARTH_RADIUS_M
  const y = toRad(point.lat - origin.lat) * EARTH_RADIUS_M
  return { x, y }
}

function distancePointSegmentMetres(p: LatLng, a: LatLng, b: LatLng): number {
  const origin = a
  const P = toLocalXY(p, origin)
  const A = { x: 0, y: 0 }
  const B = toLocalXY(b, origin)

  const ABx = B.x - A.x
  const ABy = B.y - A.y
  const lengthSq = ABx * ABx + ABy * ABy

  if (lengthSq === 0) return distanceMetres(p, a)

  let t = ((P.x - A.x) * ABx + (P.y - A.y) * ABy) / lengthSq
  t = Math.max(0, Math.min(1, t))

  const closest = { x: A.x + t * ABx, y: A.y + t * ABy }
  const dx = P.x - closest.x
  const dy = P.y - closest.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function distancePointPolylineMetres(point: LatLng, path: AxePoint[]): number | null {
  const points = path.filter((p): p is AxePoint & LatLng => p.lat !== null && p.lng !== null)
  if (points.length === 0) return null
  if (points.length === 1) return distanceMetres(point, points[0])

  let min = Infinity
  for (let i = 0; i < points.length - 1; i++) {
    const d = distancePointSegmentMetres(point, points[i], points[i + 1])
    if (d < min) min = d
  }
  return min
}

export function nearestWithDistance<T extends { lat: number | null; lng: number | null }>(
  point: LatLng,
  items: T[],
): { item: T; distance: number } | null {
  let best: { item: T; distance: number } | null = null
  for (const item of items) {
    if (item.lat === null || item.lng === null) continue
    const distance = distanceMetres(point, { lat: item.lat, lng: item.lng })
    if (!best || distance < best.distance) best = { item, distance }
  }
  return best
}

export function nearestAxe(point: LatLng, axes: Axe[]): { axe: Axe; distance: number } | null {
  let best: { axe: Axe; distance: number } | null = null
  for (const axe of axes) {
    const distance = distancePointPolylineMetres(point, axe.path)
    if (distance !== null && (!best || distance < best.distance)) best = { axe, distance }
  }
  return best
}

export function triParDistance<T extends { lat: number | null; lng: number | null }>(
  point: LatLng,
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const da = a.lat !== null && a.lng !== null ? distanceMetres(point, { lat: a.lat, lng: a.lng }) : Infinity
    const db = b.lat !== null && b.lng !== null ? distanceMetres(point, { lat: b.lat, lng: b.lng }) : Infinity
    return da - db
  })
}
