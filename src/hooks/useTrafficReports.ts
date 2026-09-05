import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import type { TrafficReport } from '../types'
import { estActif } from '../lib/traffic'

interface UseTrafficReportsResult {
  reports: TrafficReport[]
  error: boolean
  retry: () => void
}

// La peremption se fait "a la lecture" (CLAUDE.md §4) : pas de contrainte
// Firestore sur expiresAt (evite un index compose), filtrage client.
export function useTrafficReports(): UseTrafficReportsResult {
  const [reports, setReports] = useState<TrafficReport[]>([])
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!db) return
    setError(false)

    const unsubscribe = onSnapshot(
      collection(db, 'reports'),
      (snapshot) => {
        const tous = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as TrafficReport)
        setReports(tous.filter(estActif))
        setError(false)
      },
      (err) => {
        console.error('Écoute des signalements interrompue :', err)
        setError(true)
      },
    )

    return unsubscribe
  }, [retryCount])

  return { reports, error, retry: () => setRetryCount((n) => n + 1) }
}
