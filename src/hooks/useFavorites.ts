import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'libtrafic_favoris'

function lire(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favoris, setFavoris] = useState<string[]>(lire)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoris))
  }, [favoris])

  const estFavori = useCallback((id: string) => favoris.includes(id), [favoris])

  const toggleFavori = useCallback((id: string) => {
    setFavoris((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }, [])

  return { favoris, estFavori, toggleFavori }
}
