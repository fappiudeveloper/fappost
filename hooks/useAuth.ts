'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { createPostmanClient } from '@/lib/postman-client'

export function useAuth() {
  const router = useRouter()
  const { apiKey, isAuthenticated, setApiKey, logout: storeLogout } = useStore()

  async function login(rawKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = createPostmanClient(rawKey)
      const result = await client.validateKey()

      if (!result.valid) {
        return { success: false, error: 'Invalid API key. Check your Postman account settings.' }
      }

      setApiKey(rawKey)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed'
      return { success: false, error: message }
    }
  }

  function logout() {
    storeLogout()
    router.push('/login')
  }

  return { isAuthenticated, apiKey, login, logout }
}
