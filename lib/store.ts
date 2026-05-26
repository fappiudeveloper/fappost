'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  RequestState,
  HistoryEntry,
  PostmanEnvironment,
  HttpMethod,
} from './types'
import { generateId } from './utils'

interface AppStore {
  // Auth
  apiKey: string | null
  isAuthenticated: boolean
  setApiKey: (key: string) => void
  logout: () => void

  // Environment
  activeEnvironmentId: string | null
  environments: PostmanEnvironment[]
  setActiveEnvironment: (id: string | null) => void
  setEnvironments: (envs: PostmanEnvironment[]) => void

  // Current request being edited
  currentRequest: RequestState
  setCurrentRequest: (req: RequestState) => void
  updateCurrentRequest: (partial: Partial<RequestState>) => void

  // Request history
  history: HistoryEntry[]
  addToHistory: (entry: Omit<HistoryEntry, 'id'>) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
}

const defaultRequest: RequestState = {
  method: 'GET' as HttpMethod,
  url: '',
  headers: [],
  params: [],
  bodyMode: 'none',
  bodyRaw: '',
  bodyLanguage: 'json',
  bodyUrlEncoded: [],
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      apiKey: null,
      isAuthenticated: false,
      setApiKey: (key) => set({ apiKey: key, isAuthenticated: true }),
      logout: () =>
        set({
          apiKey: null,
          isAuthenticated: false,
          activeEnvironmentId: null,
          environments: [],
          currentRequest: defaultRequest,
        }),

      activeEnvironmentId: null,
      environments: [],
      setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),
      setEnvironments: (envs) => set({ environments: envs }),

      currentRequest: defaultRequest,
      setCurrentRequest: (req) => set({ currentRequest: req }),
      updateCurrentRequest: (partial) =>
        set((state) => ({
          currentRequest: { ...state.currentRequest, ...partial },
        })),

      history: [],
      addToHistory: (entry) =>
        set((state) => ({
          history: [
            { ...entry, id: generateId() },
            ...state.history.slice(0, 49),
          ],
        })),
      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'fappost-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      partialize: (state) => ({
        apiKey: state.apiKey,
        isAuthenticated: state.isAuthenticated,
        activeEnvironmentId: state.activeEnvironmentId,
        environments: state.environments,
        history: state.history,
      }),
    }
  )
)
