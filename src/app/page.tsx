import Link from 'next/link';
import { Cloud, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen sky-gradient flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Animated Clouds Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[-10%] w-[300px] h-[100px] bg-white blur-[80px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[150px] bg-white blur-[100px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-sky-dark/20 border-4 border-white">
          <Cloud className="text-primary" size={48} />
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-primary" size={20} />
          <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">Peaceful Productivity</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight max-w-4xl leading-[1.1]">
          Organize your life with <span className="text-primary">SkyTodo</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 font-medium leading-relaxed">
          A modern, nature-inspired task manager designed for calm and focus. Experience productivity like looking at a clear morning sky.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link 
            href="/signup" 
            className="btn-primary !px-10 !py-4 flex items-center gap-3 text-lg"
          >
            Get Started Free
            <ArrowRight size={20} />
          </Link>
          <Link 
            href="/login" 
            className="btn-secondary !px-10 !py-4 text-lg"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-20 flex items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
             <div className="w-8 h-8 rounded-lg bg-white/40 flex items-center justify-center">1</div> Simple
           </div>
           <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
             <div className="w-8 h-8 rounded-lg bg-white/40 flex items-center justify-center">2</div> Minimal
           </div>
           <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
             <div className="w-8 h-8 rounded-lg bg-white/40 flex items-center justify-center">3</div> Peaceful
           </div>
        </div>
      </div>
    </main>
  );
}