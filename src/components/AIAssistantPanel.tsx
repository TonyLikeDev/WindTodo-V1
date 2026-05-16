"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight, Loader2, Lightbulb, Clock, AlertTriangle, Target } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate?: Date | string | null;
  labels?: any;
}

interface AIAssistantPanelProps {
  tasks: Task[];
  onOpenTask?: (id: string) => void;
}

function analyzeTasksWithAI(tasks: Task[]): {
  nextTask: Task | null;
  overdueTasks: Task[];
  suggestions: string[];
  focusScore: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  dailySummary: string;
} {
  const now = new Date();
  const pending = tasks.filter(t => t.status !== 'DONE');
  const overdue = pending.filter(t => t.dueDate && new Date(t.dueDate) < now);
  const dueToday = pending.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.toDateString() === now.toDateString();
  });

  // Smart "next task" heuristic
  let nextTask: Task | null = null;
  if (dueToday.length > 0) nextTask = dueToday[0];
  else if (overdue.length > 0) nextTask = overdue[0];
  else if (pending.length > 0) nextTask = pending[0];

  // Focus score (0-100)
  const completed = tasks.filter(t => t.status === 'DONE').length;
  const total = tasks.length;
  const focusScore = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Burnout risk
  const burnoutRisk: 'low' | 'medium' | 'high' =
    pending.length > 20 ? 'high' :
    pending.length > 10 ? 'medium' : 'low';

  // AI suggestions
  const suggestions: string[] = [];
  if (overdue.length > 0) suggestions.push(`You have ${overdue.length} overdue tasks. Address them first to reduce stress.`);
  if (pending.length === 0) suggestions.push("Incredible! All tasks are done. Time to plan what's next.");
  if (pending.length > 15) suggestions.push("Your plate looks full. Consider delegating or rescheduling some tasks.");
  if (dueToday.length > 0) suggestions.push(`${dueToday.length} tasks are due today. Stay focused!`);
  if (focusScore > 80) suggestions.push("You're on fire! Excellent completion rate.");
  if (suggestions.length === 0) suggestions.push("Good balance! Keep up the steady progress.");

  // Daily summary
  const dailySummary = `You've completed ${completed} of ${total} tasks overall. ${
    overdue.length > 0 ? `${overdue.length} tasks need urgent attention.` :
    dueToday.length > 0 ? `${dueToday.length} tasks due today — you're on track!` :
    "Great work maintaining your workflow!"
  }`;

  return { nextTask, overdueTasks: overdue, suggestions, focusScore, burnoutRisk, dailySummary };
}

export default function AIAssistantPanel({ tasks, onOpenTask }: AIAssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeTasksWithAI> | null>(null);

  const handleAnalyze = async () => {
    if (hasAnalyzed) {
      setIsOpen(true);
      return;
    }
    setIsAnalyzing(true);
    setIsOpen(true);
    // Simulate AI "thinking"
    await new Promise(r => setTimeout(r, 1800));
    const result = analyzeTasksWithAI(tasks);
    setAnalysis(result);
    setIsAnalyzing(false);
    setHasAnalyzed(true);
  };

  const burnoutColors = {
    low: "text-green-600 bg-green-50 border-green-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    high: "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={handleAnalyze}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full glass rounded-[2rem] p-5 border-white/40 flex items-center gap-4 text-left hover:shadow-xl transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent-lavender/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent-lavender/60 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
          <Sparkles size={22} className="text-white" />
        </div>
        <div className="flex-1 relative z-10">
          <p className="text-sm font-black text-foreground">What should I do next?</p>
          <p className="text-[10px] text-muted-foreground font-medium">AI analyzes your tasks & suggests the best next step</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </motion.button>

      {/* AI Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-sky-dark/20 backdrop-blur-sm z-[110]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              className="fixed right-0 top-0 h-full w-full max-w-md glass border-l border-white/40 shadow-2xl z-[120] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent-lavender/60 flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-foreground">AI Assistant</h2>
                    <p className="text-[10px] text-muted-foreground">Powered by smart heuristics</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/40 rounded-xl text-muted-foreground">
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-60 gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto text-primary" size={20} />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Analyzing your tasks...</p>
                  </div>
                ) : analysis ? (
                  <>
                    {/* Daily Summary */}
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">📋 Daily Summary</p>
                      <p className="text-xs font-medium text-foreground leading-relaxed">{analysis.dailySummary}</p>
                    </div>

                    {/* Focus Score */}
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">🎯 Focus Score</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-white/40 rounded-full overflow-hidden border border-white/40">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${analysis.focusScore}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-lg font-black text-primary">{analysis.focusScore}%</span>
                      </div>
                    </div>

                    {/* Burnout Risk */}
                    <div className={`p-3 rounded-2xl border flex items-center gap-3 ${burnoutColors[analysis.burnoutRisk]}`}>
                      <AlertTriangle size={16} />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest">Workload Risk</p>
                        <p className="text-xs font-bold capitalize">{analysis.burnoutRisk} — {
                          analysis.burnoutRisk === 'high' ? "Consider rescheduling some tasks" :
                          analysis.burnoutRisk === 'medium' ? "Keep an eye on your pace" :
                          "Great work-life balance!"
                        }</p>
                      </div>
                    </div>

                    {/* Next Task Recommendation */}
                    {analysis.nextTask && (
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">⚡ Do This Next</p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={() => { onOpenTask?.(analysis!.nextTask!.id); setIsOpen(false); }}
                          className="w-full p-4 glass rounded-2xl border-primary/20 text-left hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                              <Target size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{analysis.nextTask.title}</p>
                              {analysis.nextTask.dueDate && (
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock size={10} />
                                  Due {new Date(analysis.nextTask.dueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                          </div>
                        </motion.button>
                      </div>
                    )}

                    {/* Overdue Tasks */}
                    {analysis.overdueTasks.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">🚨 Overdue ({analysis.overdueTasks.length})</p>
                        <div className="space-y-2">
                          {analysis.overdueTasks.slice(0, 3).map(t => (
                            <button
                              key={t.id}
                              onClick={() => { onOpenTask?.(t.id); setIsOpen(false); }}
                              className="w-full p-3 bg-red-50/60 border border-red-200/50 rounded-xl text-left hover:bg-red-50 transition-all"
                            >
                              <p className="text-xs font-bold text-red-700 truncate">{t.title}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Suggestions */}
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">💡 Smart Tips</p>
                      <div className="space-y-2">
                        {analysis.suggestions.map((s, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-white/40 rounded-xl border border-white/40">
                            <Lightbulb size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-foreground font-medium">{s}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
