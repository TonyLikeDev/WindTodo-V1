'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TriangleAlert } from 'lucide-react';

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

// Promise-based confirm, modelled on window.confirm but rendered in-app.
//
//   const { confirm, confirmDialog } = useConfirm();
//   ...
//   if (await confirm({ title: 'Delete task?', danger: true })) doDelete();
//   ...
//   return <>{...}{confirmDialog}</>;
export function useConfirm() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOpts(options);
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOpts(null);
  }, []);

  const confirmDialog = opts ? (
    <ConfirmDialog
      {...opts}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  ) : null;

  return { confirm, confirmDialog };
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmOptions & { onConfirm: () => void; onCancel: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    // Capture phase + stopPropagation so Escape/Enter resolve THIS dialog only,
    // and don't also reach a keydown handler on an underlying modal (e.g. the
    // task detail modal's own Escape-to-close listener sitting beneath us).
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onConfirm, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 animate-bubble-fade"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-bubble-pop"
      >
        <div className="px-6 pt-6 pb-4 flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              danger ? 'bg-red-500/15 text-red-500' : 'bg-primary/15 text-primary'
            }`}
          >
            <TriangleAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {message && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>
        <div className="px-6 pb-5 pt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-foreground bg-white/5 border border-border hover:bg-white/10 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold rounded-lg text-white transition-colors ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
