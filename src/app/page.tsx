import Image from 'next/image';
import Link from 'next/link';
import SkyBackground from '@/components/SkyBackground';

export default function LandingPage() {
  return (
    <SkyBackground>
      <main className="min-h-[100dvh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center mb-8 overflow-hidden">
          <Image src="/windtodo.png" alt="WindTodo" width={80} height={80} className="w-full h-full object-contain" />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-dark to-primary">WindTodo</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          A modern, glassmorphism-inspired task manager built with Next.js and Supabase. Organize your workflow seamlessly with a beautiful and responsive interface.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup" className="btn-primary">
            Join Now
          </Link>
          <Link href="/login" className="btn-secondary">
            Sign In
          </Link>
        </div>
      </main>
    </SkyBackground>
  );
}