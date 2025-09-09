import { create } from 'zustand';
import { Task, TaskType } from '../../../packages/shared/src/types';

interface TasksState {
  tasks: Task[];
  activeTaskId: string | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

interface TasksActions {
  // Data operations
  loadTasks: () => Promise<void>;
  createTask: (name: string, type?: TaskType) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // UI state
  setActiveTask: (taskId: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // Computed
  getFilteredTasks: () => Task[];
  getActiveTask: () => Task | null;
}

type TasksStore = TasksState & TasksActions;

export const useTasksStore = create<TasksStore>((set, get) => ({
  // Initial state
  tasks: [],
  activeTaskId: null,
  searchQuery: '',
  loading: false,
  error: null,

  // Data operations
  loadTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await window.electronAPI.tasks.getAll();
      set({ tasks, loading: false });
    } catch (error) {
      set({ error: 'Failed to load tasks', loading: false });
      console.error('Failed to load tasks:', error);
    }
  },

  createTask: async (name: string, type?: TaskType) => {
    set({ loading: true, error: null });
    try {
      const newTask = await window.electronAPI.tasks.create({ name, type });
      set(state => ({ 
        tasks: [...state.tasks, newTask], 
        loading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to create task', loading: false });
      console.error('Failed to create task:', error);
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    set({ loading: true, error: null });
    try {
      const updatedTask = await window.electronAPI.tasks.update(id, updates);
      if (updatedTask) {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === id ? updatedTask : task
          ),
          loading: false
        }));
      }
    } catch (error) {
      set({ error: 'Failed to update task', loading: false });
      console.error('Failed to update task:', error);
    }
  },

  deleteTask: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await window.electronAPI.tasks.delete(id);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to delete task', loading: false });
      console.error('Failed to delete task:', error);
    }
  },

  // UI state
  setActiveTask: (taskId: string | null) => {
    set({ activeTaskId: taskId });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // Computed
  getFilteredTasks: () => {
    const { tasks, searchQuery } = get();
    if (!searchQuery.trim()) return tasks;
    
    const query = searchQuery.toLowerCase();
    return tasks.filter(task => 
      task.name.toLowerCase().includes(query) ||
      task.type?.toLowerCase().includes(query)
    );
  },

  getActiveTask: () => {
    const { tasks, activeTaskId } = get();
    return tasks.find(task => task.id === activeTaskId) || null;
  },
}));
