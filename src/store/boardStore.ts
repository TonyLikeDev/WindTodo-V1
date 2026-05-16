import { create } from 'zustand'

export type ViewMode = 'kanban' | 'table' | 'calendar' | 'document'

interface BoardState {
  currentView: ViewMode
  setView: (view: ViewMode) => void
  
  // Task Modal Stack (for multi-level subtasks)
  activeTaskId: string | null
  taskStack: string[]
  openTask: (taskId: string) => void
  closeTask: () => void
  goBackTask: () => void
}

export const useBoardStore = create<BoardState>((set) => ({
  currentView: 'kanban',
  setView: (view) => set({ currentView: view }),
  
  activeTaskId: null,
  taskStack: [],
  
  openTask: (taskId) => set((state) => {
    // If opening a subtask from within a task modal
    if (state.activeTaskId) {
      return { 
        activeTaskId: taskId, 
        taskStack: [...state.taskStack, state.activeTaskId] 
      }
    }
    return { activeTaskId: taskId, taskStack: [] }
  }),
  
  closeTask: () => set({ activeTaskId: null, taskStack: [] }),
  
  goBackTask: () => set((state) => {
    const newStack = [...state.taskStack]
    const prevTaskId = newStack.pop()
    return { activeTaskId: prevTaskId || null, taskStack: newStack }
  }),
}))
