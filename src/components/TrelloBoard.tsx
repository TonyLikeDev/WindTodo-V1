"use client";

import React, { useState, useMemo } from "react";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from "@hello-pangea/dnd";
import { 
  Plus, 
  MoreHorizontal, 
  Tag, 
  GripVertical, 
  PlusCircle,
  X,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  CheckCircle,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar
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
  Tooltip,
  Legend
} from 'recharts';
import RichTextEditor from "./RichTextEditor";

// --- Types ---
type Priority = 'high' | 'medium' | 'low';

interface Card {
  id: string;
  title: string;
  label?: string;
  priority: Priority;
  isCompleted: boolean;
  description: any; // TipTap JSON
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

// --- Initial Data ---
const INITIAL_DATA: Column[] = [
  {
    id: "column-1",
    title: "Cần làm",
    cards: [
      { id: "card-1", title: "Thiết kế giao diện Login", label: "UI/UX", priority: 'high', isCompleted: false, description: null },
      { id: "card-2", title: "Kết nối API Đăng ký", label: "Backend", priority: 'medium', isCompleted: false, description: null }
    ]
  },
  {
    id: "column-2",
    title: "Đang làm",
    cards: [
      { id: "card-3", title: "Làm tính năng To-do list", label: "Frontend", priority: 'high', isCompleted: false, description: null }
    ]
  },
  {
    id: "column-3",
    title: "Đã xong",
    cards: []
  }
];

const PRIORITY_CONFIG = {
  high: { color: 'text-red-500 bg-red-500/10 border-red-500/20', label: 'Cao', dot: 'bg-red-500' },
  medium: { color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', label: 'Trung bình', dot: 'bg-yellow-500' },
  low: { color: 'text-green-500 bg-green-500/10 border-green-500/20', label: 'Thấp', dot: 'bg-green-500' },
};

export default function TrelloBoard() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_DATA);
  const [newCardTitle, setNewCardTitle] = useState<{ [colId: string]: string }>({});
  const [isAddingCard, setIsAddingCard] = useState<{ [colId: string]: boolean }>({});
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  
  // Modal State
  const [selectedCard, setSelectedCard] = useState<{ colId: string, card: Card } | null>(null);

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

  const COLORS = ['#5D9CEC', '#F6BB42', '#8CC152', '#ED5565', '#AC92EC'];

  // --- Logic Kéo Thả ---
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId);
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId);

    const sourceCol = columns[sourceColIndex];
    const destCol = columns[destColIndex];

    const sourceCards = [...sourceCol.cards];
    const [removed] = sourceCards.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceCards.splice(destination.index, 0, removed);
      const newColumns = [...columns];
      newColumns[sourceColIndex] = { ...sourceCol, cards: sourceCards };
      setColumns(newColumns);
    } else {
      const destCards = [...destCol.cards];
      destCards.splice(destination.index, 0, removed);
      const newColumns = [...columns];
      newColumns[sourceColIndex] = { ...sourceCol, cards: sourceCards };
      newColumns[destColIndex] = { ...destCol, cards: destCards };
      setColumns(newColumns);
    }
  };

  // --- Actions ---
  const handleAddCard = (colId: string) => {
    const title = newCardTitle[colId];
    if (!title?.trim()) return;

    const newCard: Card = {
      id: `card-${Date.now()}`,
      title: title.trim(),
      label: "Task",
      priority: 'low',
      isCompleted: false,
      description: null
    };

    setColumns(prev => prev.map(col => col.id === colId ? { ...col, cards: [...col.cards, newCard] } : col));
    setNewCardTitle(prev => ({ ...prev, [colId]: "" }));
    setIsAddingCard(prev => ({ ...prev, [colId]: false }));
  };

  const toggleComplete = (colId: string, cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setColumns(prev => prev.map(col => col.id === colId ? {
      ...col,
      cards: col.cards.map(c => c.id === cardId ? { ...c, isCompleted: !c.isCompleted } : c)
    } : col));
  };

  const updateCardDetails = (updatedCard: Card) => {
    if (!selectedCard) return;
    setColumns(prev => prev.map(col => col.id === selectedCard.colId ? {
      ...col,
      cards: col.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
    } : col));
    setSelectedCard({ ...selectedCard, card: updatedCard });
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* --- PERFORMANCE DASHBOARD --- */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[2.5rem] bg-white/40 border-white/60 flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <PieChartIcon size={16} className="text-primary" /> Hiệu suất công việc
              </h3>
              <span className="text-2xl font-black text-primary">{completionRate}%</span>
           </div>
           <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-auto flex justify-center gap-4">
              {statsData.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                   <span className="text-[10px] font-bold text-muted-foreground">{s.name}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="glass p-6 rounded-[2.5rem] bg-white/40 border-white/60 flex flex-col xl:col-span-2">
           <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 mb-6">
              <BarChart3 size={16} className="text-primary" /> Phân bổ nhiệm vụ
           </h3>
           <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.2)' }} />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </section>

      {/* --- KANBAN BOARD --- */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-6 h-full items-start px-2 min-w-max">
            {columns.map((column) => (
              <div key={column.id} className="w-80 flex-shrink-0 flex flex-col h-full max-h-[calc(100vh-450px)]">
                <div className="glass-card flex flex-col h-full bg-white/20 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-sky-dark/5 overflow-hidden">
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-6 bg-primary rounded-full shadow-lg shadow-primary/30" />
                      <h3 className="text-xs font-black text-foreground uppercase tracking-widest">{column.title}</h3>
                      <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-lg">
                        {column.cards.length}
                      </span>
                    </div>
                    <button className="p-1.5 hover:bg-white/40 rounded-xl transition-all text-muted-foreground hover:text-foreground">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 overflow-y-auto px-4 py-2 custom-scrollbar transition-colors duration-200 ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
                      >
                        {column.cards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-4"
                                onClick={() => setSelectedCard({ colId: column.id, card })}
                              >
                                <motion.div
                                  layout
                                  className={`group bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-sm hover:shadow-2xl transition-all cursor-pointer active:scale-95 ${snapshot.isDragging ? "rotate-2 scale-105 shadow-2xl ring-2 ring-primary/20" : ""}`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-1">
                                      <button 
                                        onClick={(e) => toggleComplete(column.id, card.id, e)}
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${card.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/30 hover:border-primary'}`}
                                      >
                                        {card.isCompleted && <CheckCircle2 size={12} />}
                                      </button>
                                      <p className={`text-sm font-bold text-foreground leading-snug ${card.isCompleted ? 'line-through text-muted-foreground opacity-50' : ''}`}>
                                        {card.title}
                                      </p>
                                    </div>
                                    <GripVertical size={14} className="text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
                                  </div>

                                  <div className="flex items-center gap-2 mt-4">
                                     <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${PRIORITY_CONFIG[card.priority].color}`}>
                                        {PRIORITY_CONFIG[card.priority].label}
                                     </span>
                                     {card.label && (
                                       <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-lg">
                                          {card.label}
                                       </span>
                                     )}
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <div className="p-4 pt-0 mt-auto">
                    {isAddingCard[column.id] ? (
                      <div className="bg-white/40 p-4 rounded-2xl border border-white/60 animate-in slide-in-from-bottom-2 duration-300">
                        <textarea
                          autoFocus
                          value={newCardTitle[column.id] || ""}
                          onChange={(e) => setNewCardTitle(prev => ({ ...prev, [column.id]: e.target.value }))}
                          placeholder="Tiêu đề công việc..."
                          className="w-full bg-transparent border-none text-sm font-bold text-foreground placeholder-muted-foreground/50 outline-none resize-none mb-3"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCard(column.id); }
                            if (e.key === "Escape") setIsAddingCard(prev => ({ ...prev, [column.id]: false }));
                          }}
                        />
                        <div className="flex items-center justify-between">
                          <button onClick={() => handleAddCard(column.id)} className="btn-primary !py-2 !px-5 !text-[10px] uppercase font-black">Lưu lại</button>
                          <button onClick={() => setIsAddingCard(prev => ({ ...prev, [column.id]: false }))} className="p-2 hover:bg-white/40 rounded-xl"><X size={16} /></button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingCard(prev => ({ ...prev, [column.id]: true }))}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/60 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:bg-white/40 hover:border-primary hover:text-primary transition-all group"
                      >
                        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform" />
                        Thêm thẻ mới
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* --- CARD DETAIL MODAL (NOTION STYLE) --- */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-sky-dark/20 backdrop-blur-md" 
              onClick={() => setSelectedCard(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass relative w-full max-w-4xl max-h-[90vh] bg-white/60 rounded-[3rem] shadow-2xl border-white overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 pb-4 flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => {
                        const updated = { ...selectedCard.card, isCompleted: !selectedCard.card.isCompleted };
                        updateCardDetails(updated);
                      }}
                      className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${selectedCard.card.isCompleted ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' : 'bg-white/40 border-white/60 text-muted-foreground hover:border-primary'}`}
                    >
                      {selectedCard.card.isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
                    </button>
                    <input 
                      value={selectedCard.card.title}
                      onChange={(e) => updateCardDetails({ ...selectedCard.card, title: e.target.value })}
                      className={`text-3xl font-black bg-transparent border-none outline-none focus:ring-0 w-full ${selectedCard.card.isCompleted ? 'line-through text-muted-foreground opacity-50' : 'text-foreground'}`}
                      placeholder="Tiêu đề nhiệm vụ"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-4 px-14">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Trạng thái:</span>
                       <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                          {columns.find(c => c.id === selectedCard.colId)?.title}
                       </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ưu tiên:</span>
                       <div className="flex gap-1">
                          {(['low', 'medium', 'high'] as Priority[]).map(p => (
                            <button 
                              key={p} 
                              onClick={() => updateCardDetails({ ...selectedCard.card, priority: p })}
                              className={`text-[10px] font-black px-3 py-1 rounded-lg transition-all border ${selectedCard.card.priority === p ? PRIORITY_CONFIG[p].color : 'bg-white/40 text-muted-foreground border-transparent hover:bg-white/60'}`}
                            >
                              {PRIORITY_CONFIG[p].label}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedCard(null)} className="p-3 hover:bg-white/60 rounded-2xl transition-all">
                  <X size={24} className="text-muted-foreground" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
                <div className="space-y-6">
                   <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Nội dung chi tiết</span>
                   </div>
                   <RichTextEditor 
                      content={selectedCard.card.description} 
                      onChange={(json) => updateCardDetails({ ...selectedCard.card, description: json })}
                   />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-white/20 bg-white/20 flex justify-end gap-4">
                 <button onClick={() => setSelectedCard(null)} className="btn-secondary !px-8">Đóng</button>
                 <button onClick={() => setSelectedCard(null)} className="btn-primary !px-8">Lưu thay đổi</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 10px; }
        .glass-card { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </div>
  );
}
