"use client";

import React, { useState, useCallback, useMemo } from "react";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from "@hello-pangea/dnd";
import { 
  Plus, 
  MoreHorizontal, 
  GripVertical, 
  X,
  Calendar,
  Tag,
  Hash,
  Layout,
  PlusCircle,
  Clock,
  ChevronRight,
  Code,
  PieChart as PieChartIcon,
  BarChart3,
  CheckCircle2,
  Circle
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';
import NotionEditor from "./NotionEditor";

// --- Types ---
export interface Task {
  id: string;
  title: string;
  label: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  isCompleted?: boolean;
  notion_content: any; // TipTap JSON structure
}

export interface ColumnData {
  id: string;
  title: string;
  cards: Task[];
}

// --- Initial Data ---
const INITIAL_DATA: ColumnData[] = [
  {
    id: "column-1",
    title: "Cần làm",
    cards: [
      {
        id: "card-1",
        title: "Thiết kế database hệ thống",
        label: "Backend",
        priority: 'high',
        dueDate: "2024-05-20",
        isCompleted: false,
        notion_content: {
          type: "doc",
          content: [
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Yêu cầu thiết kế chi tiết" }] },
            { type: "paragraph", content: [{ type: "text", text: "Cần tối ưu hóa các bảng liên kết giữa Thẻ con và Thẻ cha." }] },
            { type: "codeBlock", attrs: { language: "sql" }, content: [{ type: "text", text: "CREATE TABLE cards (...);" }] }
          ]
        }
      }
    ]
  },
  {
    id: "column-2",
    title: "Đang làm",
    cards: []
  },
  {
    id: "column-3",
    title: "Đã xong",
    cards: []
  }
];

const CHART_COLORS = ['#5D9CEC', '#F6BB42', '#8CC152', '#ED5565', '#AC92EC'];

export default function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnData[]>(INITIAL_DATA);
  const [selectedTask, setSelectedTask] = useState<{ colId: string, task: Task } | null>(null);

  // --- Statistics Calculation ---
  const statsData = useMemo(() => {
    const total = columns.reduce((acc, col) => acc + col.cards.length, 0);
    if (total === 0) return [];
    
    return columns.map(col => ({
      name: col.title,
      value: col.cards.length,
      percentage: Math.round((col.cards.length / total) * 100)
    }));
  }, [columns]);

  const completionRate = useMemo(() => {
    const allCards = columns.flatMap(col => col.cards);
    if (allCards.length === 0) return 0;
    const completed = allCards.filter(c => c.isCompleted).length;
    return Math.round((completed / allCards.length) * 100);
  }, [columns]);

  // --- Logic Kéo Thả (DnD) ---

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setColumns(prev => {
      const newCols = [...prev];
      const sourceCol = newCols.find(c => c.id === source.droppableId)!;
      const destCol = newCols.find(c => c.id === destination.droppableId)!;
      
      const sourceCards = [...sourceCol.cards];
      const [removed] = sourceCards.splice(source.index, 1);
      
      if (source.droppableId === destination.droppableId) {
        sourceCards.splice(destination.index, 0, removed);
        sourceCol.cards = sourceCards;
      } else {
        const destCards = [...destCol.cards];
        destCards.splice(destination.index, 0, removed);
        sourceCol.cards = sourceCards;
        destCol.cards = destCards;
      }
      return newCols;
    });
  }, []);

  // --- Task Actions ---
  const updateTask = (updatedTask: Task) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(t => t.id === updatedTask.id ? updatedTask : t)
    })));
    if (selectedTask?.task.id === updatedTask.id) {
      setSelectedTask(prev => prev ? { ...prev, task: updatedTask } : null);
    }
  };

  const addTask = (colId: string) => {
    const title = window.prompt("Nhập tiêu đề task:");
    if (!title) return;
    const newTask: Task = {
      id: `card-${Date.now()}`,
      title,
      label: "General",
      priority: 'low',
      dueDate: new Date().toISOString().split('T')[0],
      notion_content: null
    };
    setColumns(prev => prev.map(col => col.id === colId ? { ...col, cards: [...col.cards, newTask] } : col));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* --- PERFORMANCE DASHBOARD --- */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10 px-4">
        <div className="glass p-6 rounded-[2.5rem] bg-white/40 border-white/60 flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <PieChartIcon size={16} className="text-primary" /> Hiệu suất
              </h3>
              <span className="text-2xl font-black text-primary">{completionRate}%</span>
           </div>
           <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass p-6 rounded-[2.5rem] bg-white/40 border-white/60 flex flex-col xl:col-span-2">
           <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-primary" /> Phân bổ nhiệm vụ
           </h3>
           <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.2)' }} />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </section>

      <header className="mb-10 px-4">
         <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Workspace <span className="text-primary italic">Notion+Trello</span></h1>
         <p className="text-muted-foreground font-medium">Bảng quản lý công việc tích hợp soạn thảo văn bản khối.</p>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
          <div className="flex gap-8 h-full items-start px-4 min-w-max">
            {columns.map(col => (
              <BoardColumn key={col.id} column={col} onTaskClick={setSelectedTask} onAddTask={() => addTask(col.id)} />
            ))}
            
            <button className="w-80 h-20 flex-shrink-0 glass rounded-[2rem] border-2 border-dashed border-white/40 flex items-center justify-center gap-3 text-muted-foreground hover:bg-white/40 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px]">
               <PlusCircle size={20} /> Thêm danh sách mới
            </button>
          </div>
        </div>
      </DragDropContext>

      <AnimatePresence>
        {selectedTask && (
          <TaskModal 
            task={selectedTask.task} 
            colTitle={columns.find(c => c.id === selectedTask.colId)?.title || ""}
            onClose={() => setSelectedTask(null)} 
            onUpdate={updateTask} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Components ---

function BoardColumn({ column, onTaskClick, onAddTask }: { column: ColumnData, onTaskClick: (data: { colId: string, task: Task }) => void, onAddTask: () => void }) {
  return (
    <div className="w-80 flex-shrink-0 flex flex-col h-full max-h-[calc(100vh-250px)]">
      <div className="glass h-full rounded-[2.5rem] flex flex-col bg-white/20 border-white/60 shadow-2xl shadow-sky-dark/5 overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-white/20">
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/30" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">{column.title}</h3>
              <span className="text-[10px] font-black bg-white/60 px-2.5 py-1 rounded-full text-primary">{column.cards.length}</span>
           </div>
           <button className="p-2 hover:bg-white/40 rounded-xl transition-all text-muted-foreground"><MoreHorizontal size={18} /></button>
        </div>

        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`flex-1 overflow-y-auto px-4 py-4 custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
            >
              {column.cards.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} onClick={() => onTaskClick({ colId: column.id, task })} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <div className="p-4 mt-auto">
           <button 
             onClick={onAddTask}
             className="w-full py-4 rounded-2xl border-2 border-dashed border-white/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/40 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
           >
              <Plus size={16} /> Thêm thẻ
           </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, index, onClick }: { task: Task, index: number, onClick: () => void }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-4 outline-none"
          onClick={onClick}
        >
          <motion.div
            layout
            className={`group bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer ${snapshot.isDragging ? 'rotate-3 scale-105 shadow-2xl ring-2 ring-primary/20' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/30'}`}>
                     {task.isCompleted && <CheckCircle2 size={12} />}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'
                  }`}>
                      {task.label}
                  </span>
               </div>
               <GripVertical size={14} className="text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
            </div>
            <h4 className={`text-sm font-bold text-foreground leading-snug mb-4 ${task.isCompleted ? 'line-through text-muted-foreground opacity-50' : ''}`}>
              {task.title}
            </h4>
            <div className="flex items-center justify-between opacity-60">
               <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <Clock size={12} className="text-primary" />
                  {task.dueDate}
               </div>
               {task.notion_content && <Layout size={12} className="text-primary" />}
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}

function TaskModal({ task, colTitle, onClose, onUpdate }: { task: Task, colTitle: string, onClose: () => void, onUpdate: (t: Task) => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-sky-dark/20 backdrop-blur-md" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="glass relative w-full max-w-6xl h-full max-h-[85vh] bg-white/70 rounded-[3.5rem] shadow-2xl border-white overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Info & Actions */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/40 p-8 flex flex-col bg-white/20">
          <div className="flex items-center gap-3 mb-10 text-primary">
             <Hash size={24} />
             <span className="text-xs font-black uppercase tracking-[0.3em]">Chi tiết Task</span>
          </div>

          <div className="space-y-8">
             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Trạng thái hoàn thành</p>
                <button 
                  onClick={() => onUpdate({ ...task, isCompleted: !task.isCompleted })}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all font-black uppercase tracking-widest text-[10px] ${task.isCompleted ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' : 'bg-white/40 border-white/60 text-muted-foreground hover:border-primary'}`}
                >
                  {task.isCompleted ? <><CheckCircle2 size={16} /> Đã xong</> : <><Circle size={16} /> Đánh dấu xong</>}
                </button>
             </div>

             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Tên nhiệm vụ</p>
                <input 
                  value={task.title}
                  onChange={(e) => onUpdate({ ...task, title: e.target.value })}
                  className={`text-xl font-bold bg-white/40 border border-white/60 rounded-2xl px-4 py-3 w-full outline-none focus:ring-2 focus:ring-primary/20 ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                />
             </div>


             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Thông tin cơ bản</p>
                <div className="space-y-3">
                   <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                         <Calendar size={14} /> Hạn chót
                      </div>
                      <input 
                        type="date" 
                        value={task.dueDate}
                        onChange={(e) => onUpdate({ ...task, dueDate: e.target.value })}
                        className="bg-transparent border-none text-xs font-bold text-foreground outline-none"
                      />
                   </div>
                   <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                         <Tag size={14} /> Nhãn
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase">{task.label}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                         <ChevronRight size={14} /> Cột
                      </div>
                      <span className="text-[10px] font-black text-foreground uppercase">{colTitle}</span>
                   </div>
                </div>
             </div>
          </div>

          <button onClick={onClose} className="mt-auto btn-primary w-full !py-4 text-xs font-black uppercase tracking-widest shadow-xl">Hoàn tất & Lưu</button>
        </aside>

        {/* Right Side: Notion Editor */}
        <main className="flex-1 flex flex-col p-8 bg-white/10 relative">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <Code size={20} className="text-primary" />
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Tài liệu chi tiết (Notion Blocks)</h2>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-white/60 rounded-2xl transition-all"><X size={24} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
             <NotionEditor 
               content={task.notion_content} 
               onChange={(json) => onUpdate({ ...task, notion_content: json })} 
             />
          </div>
        </main>
      </motion.div>
    </div>
  );
}
