import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSWRConfig } from 'swr'

export function useRealtimeChat(projectId?: string, workspaceId?: string) {
  const { mutate } = useSWRConfig()
  const supabase = createClient()

  useEffect(() => {
    const targetId = projectId || workspaceId
    if (!targetId) return

    const channelName = projectId ? `realtime:chat:project:${projectId}` : `realtime:chat:workspace:${workspaceId}`
    const filter = projectId ? `projectId=eq.${projectId}` : `workspaceId=eq.${workspaceId}`
    const mutateKey = projectId ? `chat:project:${projectId}` : `chat:workspace:${workspaceId}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: filter,
        },
        (payload) => {
          console.log('Realtime Message received:', payload)
          mutate(mutateKey)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, workspaceId, mutate, supabase])
}
