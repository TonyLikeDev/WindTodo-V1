"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
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
  Sparkles,
} from "lucide-react";
import { syncUser } from "@/app/actions/userActions";

type TabKey = "general" | "notifications" | "appearance" | "security" | "billing";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "general", label: "General", icon: <User size={18} /> },
  { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  { key: "appearance", label: "Appearance", icon: <Palette size={18} /> },
  { key: "security", label: "Security", icon: <Lock size={18} /> },
  { key: "billing", label: "Billing", icon: <Shield size={18} /> },
];

export default function SettingsPage() {
  const { data: user, isLoading } = useSWR("currentUser", syncUser);

  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    // Profile save is not wired to a backend action yet.
    await new Promise((r) => setTimeout(r, 400));
    setIsSaving(false);
    setMessage({ type: "success", text: "Saved locally — backend wiring pending." });
  };

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-primary font-bold">Preparing settings...</div>;
  }

  const initial = ((name || email || "?").charAt(0) || "?").toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-primary/90" />
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Preferences</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-600 text-sm font-medium mt-1.5">Personalize your WindTodo experience with premium options.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-2">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-semibold text-sm ${
                  active
                    ? "bg-white/60 text-primary shadow-sm"
                    : "text-slate-600 hover:bg-white/30 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3 space-y-8">
          {activeTab === "general" && (
            <>
              <form onSubmit={handleSave} className="glass p-10 rounded-[3rem] border-white/40 space-y-10">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-[2rem] bg-white/40 overflow-hidden flex items-center justify-center border-4 border-white shadow-xl shadow-sky-dark/10">
                      {user?.avatarUrl ? (
                        <Image src={user.avatarUrl} alt="" width={112} height={112} className="object-cover" unoptimized />
                      ) : (
                        <span className="text-3xl font-semibold text-primary">{initial}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-extrabold text-slate-900">Profile Picture</h3>
                    <p className="text-sm text-slate-600 font-medium mt-1.5">Upload a photo to personalize your account.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-widest ml-1">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/50 border-white/60 border focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-2xl py-4 px-6 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-700/40"
                      placeholder="Your display name"
                    />
                  </div>

                  <div className="space-y-2 opacity-70">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full bg-white/30 border-white/40 border rounded-2xl py-4 px-6 text-sm font-medium text-slate-700 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {message && (
                  <div className={`p-5 rounded-2xl flex items-center gap-4 animate-bubble-pop ${
                    message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                  }`}>
                    {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-xs font-bold uppercase tracking-widest">{message.text}</p>
                  </div>
                )}

                <div className="pt-8 border-t border-white/20 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-3 !px-10 font-semibold text-sm"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save size={20} />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>

              <div className="glass p-10 rounded-[3rem] border-white/40">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-6 ml-1">Danger Zone</h3>
                <div className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <p className="text-sm font-extrabold text-red-600">Delete Account</p>
                    <p className="text-xs text-slate-600 mt-1.5 font-medium">Permanently remove all your data. This cannot be undone.</p>
                  </div>
                  <button className="px-8 py-3.5 bg-white/60 text-red-600 border border-red-500/20 rounded-2xl font-semibold text-xs hover:bg-red-500 hover:text-white transition-all whitespace-nowrap">
                    Delete Now
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab !== "general" && (
            <div className="glass p-10 rounded-[3rem] border-white/40 text-center text-slate-700">
              <p className="text-sm font-extrabold uppercase tracking-widest">{TABS.find((t) => t.key === activeTab)?.label}</p>
              <p className="text-xs mt-2 font-medium">Coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
