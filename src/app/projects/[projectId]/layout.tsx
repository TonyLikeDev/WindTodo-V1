import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { BarChart2 } from 'lucide-react';
import SkyBackground from '@/components/SkyBackground';

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return (
    <SkyBackground>
      <div className="flex flex-col h-screen overflow-hidden w-full">
        <header className="flex items-center justify-between gap-4 px-4 md:px-8 py-3 border-b border-white/20 dark:border-white/5 bg-white/20 dark:bg-black/35 backdrop-blur-md flex-shrink-0">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 overflow-hidden">
              <Image src="/windtodo.png" alt="WindTodo" width={36} height={36} className="w-full h-full object-contain" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">WindTodo</span>
          </Link>

          <Link
            href="/dashboard/stats"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/40 bg-white/45 px-3 text-sm font-bold text-foreground transition-all hover:bg-white/60"
          >
            <BarChart2 className="h-4 w-4 text-primary" />
            <span>Stats</span>
          </Link>
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </SkyBackground>
  );
}
