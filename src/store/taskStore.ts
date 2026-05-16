import { create } from 'zustand';

interface TaskStore {
  selectedTaskId: string | null;
  taskStack: string[];
  isModalOpen: boolean;
  filterStatus: string | null;
  searchQuery: string;
  collapsedLists: string[];
  
  setModalOpen: (open: boolean) => void;
  setFilterStatus: (status: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleListCollapse: (listId: string) => void;
  openTask: (id: string) => void;
  closeTask: () => void;
  goBackTask: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  selectedTaskId: null,
  taskStack: [],
  isModalOpen: false,
  filterStatus: null,
  searchQuery: '',
  collapsedLists: [],

  setModalOpen: (open) => set({ isModalOpen: open }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleListCollapse: (listId) => set((state) => ({
    collapsedLists: state.collapsedLists.includes(listId)
      ? state.collapsedLists.filter(id => id !== listId)
      : [...state.collapsedLists, listId]
  })),
  openTask: (id) => set((state) => {
    if (state.selectedTaskId && state.selectedTaskId !== id) {
      return { 
        selectedTaskId: id, 
        isModalOpen: true,
        taskStack: [...state.taskStack, state.selectedTaskId] 
      }
    }
    return { selectedTaskId: id, isModalOpen: true, taskStack: [] }
  }),
  closeTask: () => set({ selectedTaskId: null, isModalOpen: false, taskStack: [] }),
  goBackTask: () => set((state) => {
    const newStack = [...state.taskStack];
    const prevId = newStack.pop();
    return { selectedTaskId: prevId || null, taskStack: newStack, isModalOpen: !!prevId };
  }),
}));
