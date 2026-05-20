import { CSSProperties, ReactNode } from 'react';

export default function GlassCard({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`glass p-8 rounded-[2.5rem] border-white/40 dark:border-white/10 shadow-xl shadow-sky-dark/10 dark:shadow-black/30 ${className}`} style={style}>
      {children}
    </div>
  );
}
