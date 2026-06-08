'use client';

import React, { useEffect } from 'react';
import { useCollaboration, Collaborator } from './CollaborationProvider';

interface LiveCursorsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function LiveCursors({ containerRef }: LiveCursorsProps) {
  const collab = useCollaboration();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !collab) return;

    let inThrottle = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (inThrottle) return;
      inThrottle = true;

      // Throttle updates to ~40ms (25 updates per second) to prevent socket flooding
      setTimeout(() => {
        inThrottle = false;
      }, 40);

      const rect = container.getBoundingClientRect();
      
      // Calculate coordinates as percentage of the container size (0 to 1)
      const x = (e.clientX - rect.left + container.scrollLeft) / container.scrollWidth;
      const y = (e.clientY - rect.top + container.scrollTop) / container.scrollHeight;

      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        collab.updateMyPresence({ cursor: { x, y } });
      }
    };

    const handleMouseLeave = () => {
      collab.updateMyPresence({ cursor: null });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, collab]);

  if (!collab) return null;

  return (
    <>
      {collab.others.map((other: Collaborator) => {
        if (!other.cursor) return null;

        return (
          <div
            key={other.id}
            className="absolute z-[9999] pointer-events-none transition-all duration-100 ease-out select-none"
            style={{
              left: `${other.cursor.x * 100}%`,
              top: `${other.cursor.y * 100}%`,
              willChange: 'left, top',
            }}
          >
            {/* Classic SVG cursor arrow */}
            <svg
              className="w-5 h-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
              viewBox="0 0 24 24"
              fill={other.color}
              stroke="white"
              strokeWidth="2"
            >
              <path d="M5.653 4.887a.75.75 0 0 0-1.129.816l4.25 15.006a.75.75 0 0 0 1.341.137l3.13-5.289 5.289-3.13a.75.75 0 0 0-.137-1.341L5.653 4.887Z" />
            </svg>

            {/* Name tag with user's specific theme color */}
            <div
              className="absolute left-3.5 top-3.5 px-2 py-0.5 text-[10px] font-bold text-white rounded shadow-sm whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
              style={{ backgroundColor: other.color }}
            >
              {other.name}
            </div>
          </div>
        );
      })}
    </>
  );
}
