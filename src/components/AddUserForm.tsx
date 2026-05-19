'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { addUserByEmail } from '@/app/actions/userActions';

export default function AddUserForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await addUserByEmail(email);
      if (result.ok) {
        setEmail('');
        setSuccess(`Added ${result.user.email}`);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex items-start gap-2">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
              setSuccess(null);
            }}
            placeholder="user@example.com"
            required
            className="bg-transparent dark:bg-white/5 border border-border dark:border-white/10 rounded-lg px-3 py-2 text-sm text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all w-64"
          />
          <button
            type="submit"
            disabled={pending || !email}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <Plus className="w-4 h-4" />
            {pending ? 'Adding…' : 'Add user'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
        {success && <p className="text-xs text-green-400 mt-1.5">{success}</p>}
      </div>
    </form>
  );
}
