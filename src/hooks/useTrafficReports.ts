import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import type { TrafficReport } from '../types'
import { estActif } from '../lib/traffic'

// La peremption se fait "a la lecture" (CLAUDE.md §4) : pas de contrainte
// Firestore sur expiresAt (evite un index compose), filtrage client.
export function useTrafficReports() {
  const [reports, setReports] = useState<TrafficReport[]>([])

  useEffect(() => {
    if (!db) return

    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const tous = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as TrafficReport,
      )
      setReports(tous.filter(estActif))
    })

    return unsubscribe
  }, [])

  return reports
}
