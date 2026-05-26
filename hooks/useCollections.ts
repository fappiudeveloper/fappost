'use client'

import { useQuery } from '@tanstack/react-query'
import { useStore } from '@/lib/store'
import { createPostmanClient } from '@/lib/postman-client'

export function useCollections() {
  const apiKey = useStore((s) => s.apiKey)

  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const client = createPostmanClient(apiKey!)
      const data = await client.getCollections()
      return data.collections
    },
    enabled: !!apiKey,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useCollection(id: string) {
  const apiKey = useStore((s) => s.apiKey)

  return useQuery({
    queryKey: ['collections', id],
    queryFn: async () => {
      const client = createPostmanClient(apiKey!)
      return client.getCollection(id)
    },
    enabled: !!apiKey && !!id,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}
