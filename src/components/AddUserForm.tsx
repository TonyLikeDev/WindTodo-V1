'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { addUserByEmail } from '@/app/actions/userActions';

export default function AddUserForm() {
  const [open, setOpen] = useState(false);
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
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
          setSuccess(null);
        }}
        className="flex items-center gap-1.5 px-4 py-2 bg-white/80 dark:bg-white/10 text-foreground text-sm font-bold rounded-lg hover:bg-white dark:hover:bg-white/20 transition-all shadow-lg shadow-sky-dark/10 active:scale-95"
      >
        <Plus className="w-4 h-4" />
        Add user
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close add user popup"
            className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          <form
            onSubmit={submit}
            className="relative glass w-full max-w-md rounded-3xl border border-white/50 p-6 shadow-2xl shadow-sky-dark/20 animate-in zoom-in-95 duration-200"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Add user</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a user by email to create or prepare their account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-white/40 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Email address
            </label>
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
              autoFocus
              className="mt-2 w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/55 dark:bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/70 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            {success && <p className="mt-2 text-xs text-green-600">{success}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-white/40 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending || !email}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                <Plus className="h-4 w-4" />
                {pending ? 'Adding...' : 'Add user'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
