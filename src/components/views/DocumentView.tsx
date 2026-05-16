"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { getProjectTasks } from "@/app/actions/taskActions";
import { FileText, ChevronRight, Hash, CheckCircle2, Circle, Loader2 } from "lucide-react";

type DocumentViewProps = {
  projectId: string;
  lists: { id: string; name: string; [key: string]: unknown }[];
  onTaskClick: (id: string) => void;
};

import { useTaskStore } from "@/store/taskStore";

export default function DocumentView({ projectId, lists }: Omit<DocumentViewProps, 'onTaskClick'>) {
  const { openTask } = useTaskStore();
  const { data: allCards = [], isLoading } = useSWR(`project-tasks:${projectId}`, () => getProjectTasks(projectId));

  // Group cards by list
  const groupedContent = useMemo(() => {
    return (lists || []).map(list => ({
      ...list,
      cards: allCards.filter((card: any) => card.listId === list.id).sort((a: any, b: any) => a.position - b.position)
    }));
  }, [lists, allCards]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
         <Loader2 className="animate-spin text-primary/30" size={48} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-12 relative z-10">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <FileText size={24} />
             </div>
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Project Documentation</span>
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tight mb-6">Workflow Outline</h1>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl">
            A structured, text-focused perspective of your workspace. Perfect for drafting guidelines, meeting notes, and project milestones.
          </p>
        </header>

        <div className="space-y-20">
          {groupedContent.map((list) => (
            <section key={list.id} className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-4 pb-4 border-b-2 border-primary/10 group">
                <div className="w-8 h-8 rounded-xl bg-white/60 border border-white/60 shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Hash size={18} className="stroke-[3]" />
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">{list.name}</h2>
                <span className="ml-auto text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-white/40 px-3 py-1.5 rounded-full border border-white/40">
                   {list.cards.length} items
                </span>
              </div>

              <div className="space-y-3 pl-4">
                {list.cards.length === 0 ? (
                  <div className="py-8 px-6 glass rounded-[2rem] border-dashed border-white/40 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">No tasks outlined in this section...</p>
                  </div>
                ) : (
                  list.cards.map((card: any) => (
                    <div 
                      key={card.id}
                      onClick={() => openTask(card.id)}
                      className="group flex items-start gap-5 p-5 rounded-[2rem] hover:bg-white/60 hover:shadow-xl hover:shadow-sky-dark/5 cursor-pointer transition-all border border-transparent hover:border-white/60 relative overflow-hidden"
                    >
                      <div className="mt-1 transition-transform group-hover:scale-110">
                        {card.status === 'DONE' ? (
                          <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                             <CheckCircle2 size={18} />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary">
                             <Circle size={10} className="fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className={`text-lg font-bold text-foreground tracking-tight mb-2 transition-all ${card.status === 'DONE' ? 'line-through text-muted-foreground opacity-50' : 'group-hover:text-primary'}`}>
                          {card.title}
                        </h3>
                        {card.description && (
                          <div 
                            className="text-sm text-muted-foreground font-medium line-clamp-2 prose prose-sm max-w-none opacity-70 group-hover:opacity-100 transition-opacity"
                            dangerouslySetInnerHTML={{ __html: card.description }}
                          />
                        )}
                      </div>
                      <div className="mt-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <ChevronRight size={20} className="text-primary/50" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="pt-20 pb-10 text-center">
           <div className="w-20 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent mx-auto rounded-full" />
           <p className="mt-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">End of Outline</p>
        </footer>
      </div>
    </div>
  );
}
