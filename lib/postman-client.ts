import type {
  PostmanCollectionsResponse,
  PostmanCollectionDetail,
  PostmanEnvironment,
  PostmanEnvironmentDetail,
} from './types'

async function postmanFetch<T>(
  path: string,
  apiKey: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`/api/postman${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-postman-api-key': apiKey,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export function createPostmanClient(apiKey: string) {
  return {
    async validateKey(): Promise<{ valid: boolean; username?: string }> {
      return postmanFetch('/validate', apiKey)
    },

    async getCollections(): Promise<PostmanCollectionsResponse> {
      return postmanFetch('/collections', apiKey)
    },

    async getCollection(id: string): Promise<PostmanCollectionDetail> {
      return postmanFetch(`/collections/${id}`, apiKey)
    },

    async getEnvironments(): Promise<{ environments: PostmanEnvironment[] }> {
      return postmanFetch('/environments', apiKey)
    },

    async getEnvironment(id: string): Promise<PostmanEnvironmentDetail> {
      return postmanFetch(`/environments/${id}`, apiKey)
    },
  }
}
