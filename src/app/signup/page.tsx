"use client";

import { useActionState } from 'react';
import { signup } from '@/app/actions/authActions';
import Image from 'next/image';
import Link from 'next/link';
import LightSkyBackground from '@/components/LightSkyBackground';

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null);

  return (
    <LightSkyBackground>
      <main className="min-h-[100dvh] flex items-center justify-center p-4">
        <div className="bg-white/50 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(163,201,226,0.35)] w-full max-w-md p-6 rounded-2xl flex flex-col items-center">
          <div className="w-14 h-14 bg-white/30 rounded-xl flex items-center justify-center mb-4 border border-white/40 overflow-hidden shadow-sm">
            <Image src="/windtodo.png" alt="WindTodo" width={56} height={56} className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-xl font-bold text-[#2C3E50] mb-5 tracking-tight">Create Account</h1>
          
          <form className="w-full space-y-4" action={formAction}>
            {state?.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                <p className="text-sm text-red-400">{state.error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1 px-1">Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="tony@stark.com" 
                className="w-full bg-white/60 border border-white/50 rounded-lg px-4 py-2.5 text-sm text-[#2C3E50] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5D9CEC] transition-all" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1 px-1">Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                className="w-full bg-white/60 border border-white/50 rounded-lg px-4 py-2.5 text-sm text-[#2C3E50] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5D9CEC] transition-all" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1 px-1">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="••••••••" 
                className="w-full bg-white/60 border border-white/50 rounded-lg px-4 py-2.5 text-sm text-[#2C3E50] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5D9CEC] transition-all" 
                required 
              />
            </div>
            
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-[#5D9CEC] hover:bg-[#4a89dc] text-white font-bold py-2.5 mt-2 rounded-lg transition-all shadow-[0_4px_14px_0_rgba(93,156,236,0.3)] transform hover:-translate-y-0.5 active:translate-y-0 text-center text-sm disabled:opacity-50 disabled:transform-none cursor-pointer"
            >
              {isPending ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="mt-5 flex items-center w-full">
            <div className="flex-grow border-t border-white/40"></div>
            <span className="px-3 text-xs text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/40"></div>
          </div>
          
          <p className="mt-5 text-sm text-slate-500">
            Already have an account? <Link href="/login" className="text-[#5D9CEC] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </main>
    </LightSkyBackground>
  );
}