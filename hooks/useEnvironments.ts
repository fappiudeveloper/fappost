'use client'

import { useQuery } from '@tanstack/react-query'
import { useStore } from '@/lib/store'
import { createPostmanClient } from '@/lib/postman-client'

export function useEnvironments() {
  const apiKey = useStore((s) => s.apiKey)
  const setEnvironments = useStore((s) => s.setEnvironments)

  return useQuery({
    queryKey: ['environments'],
    queryFn: async () => {
      const client = createPostmanClient(apiKey!)
      const data = await client.getEnvironments()
      setEnvironments(data.environments)
      return data.environments
    },
    enabled: !!apiKey,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

export function useActiveEnvironment() {
  const apiKey = useStore((s) => s.apiKey)
  const activeEnvironmentId = useStore((s) => s.activeEnvironmentId)

  return useQuery({
    queryKey: ['environments', activeEnvironmentId],
    queryFn: async () => {
      const client = createPostmanClient(apiKey!)
      return client.getEnvironment(activeEnvironmentId!)
    },
    enabled: !!apiKey && !!activeEnvironmentId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}
