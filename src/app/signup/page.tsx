"use client";

import { useActionState } from 'react';
import { signup } from '@/app/actions/authActions';
import Image from 'next/image';
import Link from 'next/link';
import SkyBackground from '@/components/SkyBackground';

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null);

  return (
    <SkyBackground>
      <main className="min-h-[100dvh] flex items-center justify-center p-4">
        <div className="glass w-full max-w-md p-6 rounded-2xl flex flex-col items-center">
          <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
            <Image src="/windtodo.png" alt="WindTodo" width={56} height={56} className="w-full h-full object-contain" />
          </div>

          <h1 className="text-xl font-bold text-foreground mb-5 tracking-tight">Create Account</h1>

          <form className="w-full space-y-4" action={formAction}>
            {state?.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center mb-4">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1 px-1">Email</label>
              <input type="email" name="email" placeholder="tony@stark.com" className="w-full bg-white/60 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1 px-1">Password</label>
              <input type="password" name="password" placeholder="••••••••" className="w-full bg-white/60 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1 px-1">Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="••••••••" className="w-full bg-white/60 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" required />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-sky-dark text-primary-foreground font-bold py-2.5 mt-2 rounded-lg transition-all shadow-lg hover:shadow-primary/30 transform hover:-translate-y-0.5 active:translate-y-0 text-center text-sm disabled:opacity-50 disabled:transform-none"
            >
              {isPending ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-5 flex items-center w-full">
            <div className="flex-grow border-t border-border" />
            <span className="px-3 text-xs text-muted-foreground uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </main>
    </SkyBackground>
  );
}