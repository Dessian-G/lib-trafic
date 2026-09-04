import { useEffect, useState } from 'react'

interface OnlineState {
  online: boolean
  offlineSince: number | null
}

export function useOnlineStatus(): OnlineState {
  const [state, setState] = useState<OnlineState>(() => ({
    online: navigator.onLine,
    offlineSince: navigator.onLine ? null : Date.now(),
  }))

  useEffect(() => {
    const handleOnline = () => setState({ online: true, offlineSince: null })
    const handleOffline = () => setState({ online: false, offlineSince: Date.now() })
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return state
}
