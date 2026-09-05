import { useEffect, useState } from 'react'

// Pour les elements rendus hors React (Leaflet : marqueurs/polylines en style
// inline), qui ne beneficient pas des variantes `dark:` de Tailwind.
export function useColorScheme(): 'light' | 'dark' {
  const query = '(prefers-color-scheme: dark)'
  const [scheme, setScheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia(query).matches ? 'dark' : 'light',
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setScheme(e.matches ? 'dark' : 'light')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return scheme
}

export function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return reduced
}
