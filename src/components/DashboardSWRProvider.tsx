'use client';

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

interface Props {
  // Keys must match the SWR cache keys used by dashboard child components.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fallback: Record<string, any>;
  children: ReactNode;
}

/**
 * Wraps dashboard children in an SWRConfig that pre-populates the cache with
 * server-fetched data. Child components using useSWR will find their data
 * immediately on first render — no loading skeleton, no extra round-trip.
 */
export default function DashboardSWRProvider({ fallback, children }: Props) {
  return (
    <SWRConfig value={{ fallback }}>
      {children}
    </SWRConfig>
  );
}
