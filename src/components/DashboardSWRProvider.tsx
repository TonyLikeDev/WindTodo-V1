'use client'

import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'

// Only persist these stable keys — keeps localStorage lean.
const PERSIST_KEYS = new Set(['projects', 'recent_assignments', 'auth-user'])
const STORAGE_KEY = 'windtodo-swr-v1'

function localStorageProvider() {
  // Guard for any unexpected SSR invocation (SWR calls this on mount, but be safe).
  if (typeof window === 'undefined') return new Map()

  let map: Map<string, unknown>
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    map = new Map(raw ? JSON.parse(raw) : [])
  } catch {
    // JSON parse error or localStorage blocked (e.g. private mode on some browsers)
    map = new Map()
  }

  // Persist relevant keys before the page unloads so the next visit is instant.
  // Besides the stable whitelist, persist every project board's lists
  // (`board:<projectId>`) so returning to a board renders columns immediately.
  window.addEventListener('beforeunload', () => {
    try {
      const entries = [...map.entries()].filter(([k]) => {
        const key = k as string
        return PERSIST_KEYS.has(key) || key.startsWith('board:')
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch { /* ignore QuotaExceededError */ }
  })

  return map
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fallback?: Record<string, any>
  /** Set true only on the outermost provider (in page.tsx) to establish the localStorage cache.
   *  Inner providers (per streaming section) pass only `fallback` and inherit the outer cache. */
  provideCache?: boolean
  children: ReactNode
}

/**
 * Wraps children in SWRConfig.
 *
 * Outermost usage (provideCache=true): establishes a localStorage-backed cache so
 * return visits render instantly from stored data, then silently revalidate.
 *
 * Inner usage (fallback only): injects server-fetched data as SWR fallback so
 * client components find their data in cache on first render — no loading skeleton.
 * Inherits the outer localStorage cache automatically (no provider = inherit parent).
 */
export default function DashboardSWRProvider({ fallback, provideCache, children }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: Record<string, any> = {}
  if (provideCache) value.provider = localStorageProvider
  if (fallback)     value.fallback  = fallback

  return <SWRConfig value={value}>{children}</SWRConfig>
}
