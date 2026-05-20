'use client';

import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  cta?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  variant?: 'panel' | 'compact';
  accent?: string;
  className?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  variant = 'panel',
  accent = 'rgb(99, 102, 241)',
  className = '',
}: EmptyStateProps) {
  const isCompact = variant === 'compact';

  const wrapper = isCompact
    ? 'flex flex-col items-center justify-center gap-2 py-6 px-4 text-center'
    : 'flex flex-col items-center justify-center gap-3 py-10 px-6 text-center rounded-2xl border border-dashed border-foreground/15 dark:border-white/10 bg-gradient-to-br from-white/40 to-white/10 dark:from-slate-900/40 dark:to-slate-900/10';

  const iconWrap = isCompact
    ? 'w-10 h-10 rounded-xl flex items-center justify-center'
    : 'w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner';

  return (
    <div className={`${wrapper} ${className}`}>
      <div
        className={iconWrap}
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 22%, transparent), color-mix(in srgb, ${accent} 8%, transparent))`,
          color: accent,
        }}
      >
        <Icon className={isCompact ? 'w-5 h-5' : 'w-6 h-6'} strokeWidth={1.75} />
      </div>

      <div className="space-y-1 max-w-xs">
        <p className={`font-bold text-foreground ${isCompact ? 'text-sm' : 'text-base'}`}>
          {title}
        </p>
        {description && (
          <p className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {description}
          </p>
        )}
      </div>

      {cta &&
        (cta.href ? (
          <a
            href={cta.href}
            className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-sky-dark transition-all shadow-md shadow-primary/20"
          >
            {cta.label}
            <span aria-hidden>→</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={cta.onClick}
            className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-sky-dark transition-all shadow-md shadow-primary/20"
          >
            {cta.label}
            <span aria-hidden>→</span>
          </button>
        ))}
    </div>
  );
}
