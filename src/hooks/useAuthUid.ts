import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from '../firebase'

export function useAuthUid(): string | null {
  const [uid, setUid] = useState<string | null>(auth?.currentUser?.uid ?? null)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (user) => setUid(user?.uid ?? null))
  }, [])

  return uid
}
