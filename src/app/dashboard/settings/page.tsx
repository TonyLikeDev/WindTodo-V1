"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { syncUser, updateUserProfile } from "@/app/actions/userActions";
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Shield, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  Sparkles
} from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  const { data: user, mutate, isLoading } = useSWR("currentUser", syncUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateUserProfile({ name });
      await mutate();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-primary font-bold">Preparing settings...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Preferences</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">Personalize your SkyTodo experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <SettingsNavLink icon={<User size={18} />} label="General" active />
          <SettingsNavLink icon={<Bell size={18} />} label="Notifications" />
          <SettingsNavLink icon={<Palette size={18} />} label="Appearance" />
          <SettingsNavLink icon={<Lock size={18} />} label="Security" />
          <SettingsNavLink icon={<Shield size={18} />} label="Billing" />
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-8">
          <form onSubmit={handleSave} className="glass p-10 rounded-[3rem] border-white/40 space-y-10">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-[2rem] bg-white/40 overflow-hidden flex items-center justify-center border-4 border-white shadow-xl shadow-sky-dark/10">
                  {user?.avatarUrl ? (
                    <Image src={user.avatarUrl} alt="" width={112} height={112} className="object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">{(name || email).charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button type="button" className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100">
                  <Camera size={18} />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-foreground">Profile Picture</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">Upload a photo to personalize your account.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/40 border-white/40 border focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-2xl py-4 px-6 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground/40"
                  placeholder="Your peaceful name"
                />
              </div>

              <div className="space-y-3 opacity-60">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-white/20 border-white/20 border rounded-2xl py-4 px-6 text-sm font-bold text-muted-foreground outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {message && (
              <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 ${
                message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="text-xs font-bold uppercase tracking-widest">{message.text}</p>
              </div>
            )}

            <div className="pt-8 border-t border-white/20 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary flex items-center gap-3 !px-10"
              >
                {isSaving ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="glass p-10 rounded-[3rem] border-white/40">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-6 ml-1">Danger Zone</h3>
            <div className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-red-500">Delete Account</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Permanently remove all your data. This cannot be undone.</p>
              </div>
              <button className="px-8 py-3.5 bg-white/60 text-red-500 border border-red-500/20 rounded-2xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all whitespace-nowrap">
                Delete Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsNavLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
      active ? "bg-white/60 text-primary shadow-sm" : "text-muted-foreground hover:bg-white/30 hover:text-foreground"
    }`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
