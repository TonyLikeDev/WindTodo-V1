'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Search, X, Check, Loader2 } from 'lucide-react';
import { searchUsers } from '@/app/actions/userActions';
import { addUserByEmail } from '@/app/actions/userActions';

type UserSuggestion = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export default function InviteUserModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [selected, setSelected] = useState<UserSuggestion | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchUsers(query);
      setSuggestions(results);
      setSearching(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function closePanel() {
    setOpen(false);
    setQuery('');
    setSuggestions([]);
    setSelected(null);
    setError(null);
    setSuccess(null);
  }

  function handleSelect(user: UserSuggestion) {
    setSelected(user);
    setQuery(user.email);
    setSuggestions([]);
  }

  function handleInvite() {
    if (pending) return;
    const email = selected?.email ?? query.trim();
    if (!email) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await addUserByEmail(email);
      if (result.ok) {
        setSuccess(`Invited ${result.user.email}`);
        router.refresh();
        setTimeout(closePanel, 1500);
      } else {
        setError(result.error);
      }
    });
  }

  function getInitials(user: UserSuggestion) {
    const display = user.name || user.email.split('@')[0];
    return display.slice(0, 2).toUpperCase();
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        id="invite-user-btn"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg active:scale-95"
      >
        <UserPlus className="w-4 h-4" />
        Invite User
      </button>

      {/* Floating panel */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.10)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
          }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">Invite a user</span>
            <button
              onClick={closePanel}
              className="text-gray-400 hover:text-gray-700 transition-colors rounded-lg p-0.5"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search field */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                id="invite-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(null);
                  setError(null);
                  setSuccess(null);
                }}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.08)' }}
              />
            </div>
          </div>

          {/* Suggestions */}
          {(searching || suggestions.length > 0) && (
            <div className="px-2 pb-2 max-h-52 overflow-y-auto">
              {searching ? (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Searching…
                </div>
              ) : (
                suggestions.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelect(u)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-200 shrink-0 overflow-hidden">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatarUrl} alt={u.name ?? u.email} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(u)
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {u.name || u.email.split('@')[0]}
                      </span>
                      <span className="text-xs text-gray-400 truncate">{u.email}</span>
                    </div>
                    {selected?.id === u.id && <Check className="w-4 h-4 text-green-500 ml-auto shrink-0" />}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <p className="px-4 pb-2 text-xs text-red-500">{error}</p>
          )}
          {success && (
            <p className="px-4 pb-2 text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> {success}
            </p>
          )}

          {/* Invite button */}
          <div className="px-4 pb-4 pt-1">
            <button
              id="send-invite-btn"
              onClick={handleInvite}
              disabled={pending || (!selected && !query.trim())}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              style={{ background: '#111827', color: '#fff' }}
            >
              {pending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Inviting…</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Send Invite</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
