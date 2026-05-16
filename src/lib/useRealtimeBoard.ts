import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSWRConfig } from 'swr'

export function useRealtimeBoard(projectId: string) {
  const { mutate } = useSWRConfig()
  const supabase = createClient()

  useEffect(() => {
    if (!projectId) return

    // Subscribe to Task table changes
    const channel = supabase
      .channel(`realtime:board:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Task',
        },
        async (payload) => {
          console.log('Realtime Task update:', payload)
          // For any change, we refresh all tasks in the project
          // We use the same key pattern as in useSWR
          mutate((key) => typeof key === 'string' && key.includes(`tasks:`))
          mutate((key) => typeof key === 'string' && key.includes(`project:${projectId}`))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, mutate, supabase])
}
