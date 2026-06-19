'use client';

import { useMemo, useRef, useState } from 'react';
import { X, Sparkles, Upload, FileText, Image as ImageIcon, Loader2, ArrowLeft, Check } from 'lucide-react';
import { createTasksBulk } from '@/app/actions/taskActions';

type ExtractedTask = {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type?: 'TASK' | 'STORY' | 'BUG';
};

type EditableTask = ExtractedTask & { include: boolean };

interface ImportNotesModalProps {
  lists: { id: string; name: string }[];
  onClose: () => void;
  onImported: (listId: string) => void;
}

const IMAGE_SOFT_MAX = 4 * 1024 * 1024;

export default function ImportNotesModal({ lists, onClose, onImported }: ImportNotesModalProps) {
  const [mode, setMode] = useState<'upload' | 'text'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'input' | 'review'>('input');
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<EditableTask[]>([]);
  const [adding, setAdding] = useState(false);

  const defaultListId = useMemo(() => {
    const todo = lists.find((l) => /^to[- ]?do$/i.test(l.name.trim()));
    return (todo ?? lists[0])?.id ?? '';
  }, [lists]);
  const [targetListId, setTargetListId] = useState(defaultListId);

  const selectedCount = tasks.filter((t) => t.include && t.title.trim()).length;

  const acceptFile = (f: File | null) => {
    if (!f) return;
    const isDocx =
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      /\.docx$/i.test(f.name);
    const ok = f.type.startsWith('image/') || f.type === 'application/pdf' || isDocx;
    if (!ok) {
      setError('Please choose an image, PDF, or Word (.docx) file.');
      return;
    }
    if (f.type.startsWith('image/') && f.size > IMAGE_SOFT_MAX) {
      setError('Image is over ~4 MB — please use a smaller photo.');
      return;
    }
    setError(null);
    setFile(f);
  };

  const canExtract = mode === 'upload' ? !!file : pastedText.trim().length > 0;

  const handleExtract = async () => {
    if (!canExtract || extracting) return;
    setError(null);
    setExtracting(true);
    try {
      const body = new FormData();
      if (mode === 'upload' && file) body.append('file', file);
      else body.append('text', pastedText.trim());

      const res = await fetch('/api/ai/extract-tasks', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Extraction failed.');

      const incoming: ExtractedTask[] = Array.isArray(data.tasks) ? data.tasks : [];
      setTasks(incoming.map((t) => ({ ...t, include: true })));
      setTargetListId(defaultListId);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed.');
    } finally {
      setExtracting(false);
    }
  };

  const handleAdd = async () => {
    if (selectedCount === 0 || adding || !targetListId) return;
    setError(null);
    setAdding(true);
    try {
      const payload = tasks
        .filter((t) => t.include && t.title.trim())
        .map((t) => ({
          title: t.title.trim(),
          description: t.description,
          priority: t.priority,
          type: t.type,
        }));
      await createTasksBulk(targetListId, payload);
      onImported(targetListId);
      onClose();
    } catch {
      setError('Could not add tasks. Please try again.');
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass w-full max-w-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Import tasks from notes
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/40 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'input' ? (
          <div className="px-6 pb-6">
            {/* Mode toggle */}
            <div className="flex p-1 mb-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 text-sm font-bold">
              <button
                onClick={() => setMode('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  mode === 'upload' ? 'bg-white/80 dark:bg-white/15 text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Photo / PDF
              </button>
              <button
                onClick={() => setMode('text')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  mode === 'text' ? 'bg-white/80 dark:bg-white/15 text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Paste text
              </button>
            </div>

            {mode === 'upload' ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); acceptFile(e.dataTransfer.files?.[0] ?? null); }}
                onClick={() => !extracting && fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 cursor-pointer transition-colors
                  ${dragOver ? 'border-primary/60 bg-primary/5' : 'border-border/60 hover:border-border hover:bg-white/[0.03]'}
                  ${extracting ? 'pointer-events-none opacity-60' : ''}
                `}
              >
                {file ? (
                  file.type.startsWith('image/') ? (
                    <ImageIcon className="w-6 h-6 text-primary" />
                  ) : (
                    <FileText className="w-6 h-6 text-primary" />
                  )
                ) : (
                  <Upload className={`w-6 h-6 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
                <div className="text-center">
                  <p className="text-sm text-foreground font-medium">
                    {file ? file.name : dragOver ? 'Drop it here' : 'Drag & drop, or click to browse'}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    Photo (≤ 4 MB), PDF, or Word (.docx)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => { acceptFile(e.target.files?.[0] ?? null); e.target.value = ''; }}
                />
              </div>
            ) : (
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={'Paste or type your notes…\n- call the dentist\n- finish the slide deck\n- buy milk'}
                className="w-full min-h-[160px] bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none"
              />
            )}

            {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

            <button
              onClick={handleExtract}
              disabled={!canExtract || extracting}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 disabled:text-foreground/40 text-white rounded-xl text-sm font-bold transition-all"
            >
              {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {extracting ? 'Reading your notes…' : 'Extract tasks'}
            </button>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <p className="text-xs text-muted-foreground mb-3">
              Review the tasks, edit titles, and uncheck anything you don&apos;t want.
            </p>

            <div className="max-h-[320px] overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
              {tasks.map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setTasks((prev) => prev.map((x, j) => (j === i ? { ...x, include: !x.include } : x)))}
                    className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      t.include ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                    }`}
                    aria-label={t.include ? 'Exclude task' : 'Include task'}
                  >
                    {t.include && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <input
                    value={t.title}
                    onChange={(e) => setTasks((prev) => prev.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                    className={`flex-1 bg-transparent text-sm focus:outline-none ${t.include ? 'text-foreground' : 'text-muted-foreground line-through'}`}
                  />
                  {t.priority && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/50 dark:bg-white/10 text-muted-foreground">
                      {t.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Target list */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Add to</span>
              <select
                value={targetListId}
                onChange={(e) => setTargetListId(e.target.value)}
                className="flex-1 appearance-none bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer"
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => { setStep('input'); setError(null); }}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/10 rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleAdd}
                disabled={selectedCount === 0 || adding || !targetListId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 disabled:text-foreground/40 text-white rounded-xl text-sm font-bold transition-all"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {adding ? 'Adding…' : `Add ${selectedCount} task${selectedCount === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
