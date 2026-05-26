'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function RootPage() {
  const router = useRouter()
  const isAuthenticated = useStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/collections')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  return (
    <div className="flex h-full items-center justify-center bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
    </div>
  )
}
