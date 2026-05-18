'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

const TIPS = [
  'Double-tap on empty space to create a new task list.',
  'Drag a task between columns to change its status instantly.',
  'Click any task card to open its details and assign a teammate.',
  'Switch between Roadmap, Kanban, and Backlog using the pill bar at the bottom.',
  'Use "Switch boards" on the right to jump to another project without leaving the page.',
];

const MIN_INTERVAL_MS = 5 * 1000;
const MAX_INTERVAL_MS = 10 * 1000;
const AUTO_DISMISS_MS = 4 * 1000;

function randomInterval() {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

export default function ProjectTipsBubble() {
  const [tipIndex, setTipIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNextTip = useCallback(() => {
    setTipIndex((i) => (i + 1) % TIPS.length);
    setOpen(true);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => setOpen(false), AUTO_DISMISS_MS);
  }, []);

  const scheduleNext = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      showNextTip();
      scheduleNext();
    }, randomInterval());
  }, [showNextTip]);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [scheduleNext]);

  function handleIconClick() {
    if (open) {
      setOpen(false);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      return;
    }
    showNextTip();
    scheduleNext();
  }

  return (
    <div className="absolute bottom-6 right-6 z-30 flex items-end gap-3">
      <div
        className={`transition-all duration-300 ease-out ${
          open
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-6 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-border shadow-xl shadow-sky-dark/20 px-4 py-3 w-72">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Tip
            </span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
              }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss tip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-foreground leading-snug">{TIPS[tipIndex]}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleIconClick}
        aria-label={open ? 'Hide tip' : 'Show a tip'}
        className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
      >
        <Lightbulb className="w-5 h-5" />
      </button>
    </div>
  );
}
