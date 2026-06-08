'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { LiveblocksProvider, RoomProvider, useMyPresence, useOthers, useBroadcastEvent, useEventListener } from '@liveblocks/react';
import { mutate as globalMutate } from 'swr';

export type Collaborator = {
  id: string;
  name: string;
  image: string | null;
  color: string;
  cursor: { x: number; y: number } | null;
};

interface CollaborationContextType {
  isConfigured: boolean;
  others: Collaborator[];
  updateMyPresence: (presence: { cursor: { x: number; y: number } | null }) => void;
  broadcastBoardUpdate: (type: 'LISTS' | 'TASKS', payload: any) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export function useCollaboration() {
  return useContext(CollaborationContext);
}

// Declaration merging for Liveblocks v2 type safety
declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
    };
    RoomEvent:
      | { type: 'MUTATE_LISTS'; projectId: string }
      | { type: 'MUTATE_TASKS'; listIds: string[] };
  }
}

interface CollaborationProviderProps {
  children: React.ReactNode;
  projectId: string;
  isConfigured: boolean;
}

export function CollaborationProvider({ children, projectId, isConfigured }: CollaborationProviderProps) {
  if (isConfigured) {
    return (
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider id={`project-${projectId}`} initialPresence={{ cursor: null }}>
          <LiveblocksInner projectId={projectId}>{children}</LiveblocksInner>
        </RoomProvider>
      </LiveblocksProvider>
    );
  }

  return <SimulatedCollaborationInner>{children}</SimulatedCollaborationInner>;
}

// ─── REAL LIVEBLOCKS ENGINE ──────────────────────────────────────────────────

function LiveblocksInner({ children, projectId }: { children: React.ReactNode; projectId: string }) {
  const [myPresence, updateMyPresence] = useMyPresence();
  const rawOthers = useOthers();
  const broadcast = useBroadcastEvent();

  const others = rawOthers.map((o) => ({
    id: o.connectionId.toString(),
    name: (o.info as any)?.name || 'Anonymous',
    image: (o.info as any)?.image || null,
    color: (o.info as any)?.color || '#9333ea',
    cursor: o.presence.cursor || null,
  }));

  const broadcastBoardUpdate = (type: 'LISTS' | 'TASKS', payload: any) => {
    if (type === 'LISTS') {
      broadcast({ type: 'MUTATE_LISTS', projectId });
    } else {
      broadcast({ type: 'MUTATE_TASKS', listIds: payload.listIds });
    }
  };

  useEventListener(({ event }) => {
    if (event.type === 'MUTATE_LISTS') {
      globalMutate(`board:${event.projectId}`);
    } else if (event.type === 'MUTATE_TASKS') {
      event.listIds.forEach((listId: string) => {
        globalMutate(listId);
      });
    }
  });

  const value: CollaborationContextType = {
    isConfigured: true,
    others,
    updateMyPresence: (presence) => updateMyPresence(presence),
    broadcastBoardUpdate,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

// ─── SIMULATED ENGINE FOR DEMO MODE ──────────────────────────────────────────

function SimulatedCollaborationInner({ children }: { children: React.ReactNode }) {
  const [others, setOthers] = useState<Collaborator[]>([]);

  useEffect(() => {
    const names = ['Aria Celestial', 'Leo Stardust', 'Luna Nebula', 'Orion Aurora'];
    const colors = ['#a855f7', '#ec4899', '#f59e0b', '#3b82f6'];

    const initialCollaborators = names.map((name, i) => ({
      id: `sim-${i}`,
      name,
      image: null,
      color: colors[i],
      cursor: null,
    }));

    setOthers(initialCollaborators);

    // Periodically update their cursors to make the board feel alive
    const interval = setInterval(() => {
      setOthers((prev) =>
        prev.map((c) => {
          const rand = Math.random();
          // 15% chance user goes inactive
          if (rand < 0.15) {
            return { ...c, cursor: null };
          }
          // 40% chance of a larger jump or appearing
          if (rand < 0.4 || !c.cursor) {
            return {
              ...c,
              cursor: {
                x: 0.1 + Math.random() * 0.8,
                y: 0.1 + Math.random() * 0.8,
              },
            };
          }
          // 45% chance of a small drift
          return {
            ...c,
            cursor: {
              x: Math.max(0.05, Math.min(0.95, c.cursor.x + (Math.random() - 0.5) * 0.05)),
              y: Math.max(0.05, Math.min(0.95, c.cursor.y + (Math.random() - 0.5) * 0.05)),
            },
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const value: CollaborationContextType = {
    isConfigured: false,
    others,
    updateMyPresence: () => {}, // No-op
    broadcastBoardUpdate: () => {}, // No-op
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}
