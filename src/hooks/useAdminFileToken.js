import { useEffect, useState } from 'react'
import pb from '../utils/pocketbase'

// Protected PocketBase files use short-lived file tokens, not the auth token.
export function useAdminFileToken() {
  const [token, setToken] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    let timer
    const refresh = async () => {
      try {
        const next = await pb.files.getToken()
        if (active) {
          setToken(next)
          setError(false)
        }
      } catch {
        if (active) {
          setToken('')
          setError(true)
        }
      } finally {
        // Default file tokens last two minutes. Refresh before expiry, retry on failure.
        if (active) timer = setTimeout(refresh, 60_000)
      }
    }
    refresh()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [])

  return { token, error }
}
