import Store from 'electron-store';
import { v4 as uuid } from 'uuid';
import { Task, Session, Settings, TaskType, SessionKind } from '../../packages/shared/src/types';

// Default settings
const defaultSettings: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  launchAtLogin: false,
};

// Store schemas
const tasksStore = new Store<{ tasks: Task[] }>({
  name: 'tasks',
  defaults: {
    tasks: [],
  },
});

const sessionsStore = new Store<{ sessions: Session[] }>({
  name: 'sessions',
  defaults: {
    sessions: [],
  },
});

const settingsStore = new Store<Settings>({
  name: 'settings',
  defaults: defaultSettings,
});

// Task operations
export const taskOperations = {
  getAll(): Task[] {
    return tasksStore.get('tasks', []);
  },

  create(taskData: Omit<Task, 'id' | 'createdAt'>): Task {
    const task: Task = {
      id: uuid(),
      createdAt: Date.now(),
      ...taskData,
    };
    
    const tasks = this.getAll();
    tasks.push(task);
    tasksStore.set('tasks', tasks);
    
    return task;
  },

  update(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getAll();
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    const updatedTask = { ...tasks[index], ...updates };
    tasks[index] = updatedTask;
    tasksStore.set('tasks', tasks);
    
    return updatedTask;
  },

  delete(id: string): boolean {
    const tasks = this.getAll();
    const filtered = tasks.filter(t => t.id !== id);
    
    if (filtered.length === tasks.length) return false;
    
    tasksStore.set('tasks', filtered);
    return true;
  },
};

// Session operations
export const sessionOperations = {
  getAll(): Session[] {
    return sessionsStore.get('sessions', []);
  },

  getToday(taskId?: string): Session[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    
    const sessions = this.getAll();
    return sessions.filter(session => {
      const isToday = session.startedAt >= todayStart;
      const matchesTask = !taskId || session.taskId === taskId;
      return isToday && matchesTask;
    });
  },

  create(sessionData: Omit<Session, 'id'>): Session {
    const session: Session = {
      id: uuid(),
      ...sessionData,
    };
    
    const sessions = this.getAll();
    sessions.push(session);
    sessionsStore.set('sessions', sessions);
    
    return session;
  },

  update(id: string, updates: Partial<Session>): Session | null {
    const sessions = this.getAll();
    const index = sessions.findIndex(s => s.id === id);
    
    if (index === -1) return null;
    
    const updatedSession = { ...sessions[index], ...updates };
    sessions[index] = updatedSession;
    sessionsStore.set('sessions', sessions);
    
    return updatedSession;
  },
};

// Settings operations
export const settingsOperations = {
  get(): Settings {
    return settingsStore.store;
  },

  update(updates: Partial<Settings>): Settings {
    const current = this.get();
    const updated = { ...current, ...updates };
    
    Object.entries(updates).forEach(([key, value]) => {
      settingsStore.set(key as keyof Settings, value);
    });
    
    return updated;
  },

  reset(): Settings {
    settingsStore.clear();
    return this.get();
  },
};

// Utility functions
export const storeUtils = {
  // Get completed work sessions count for today
  getTodayWorkSessionCount(taskId?: string): number {
    const todaySessions = sessionOperations.getToday(taskId);
    return todaySessions.filter(s => s.kind === 'work').length;
  },

  // Clean up old sessions (older than 30 days)
  cleanupOldSessions(): number {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const sessions = sessionOperations.getAll();
    const filtered = sessions.filter(s => s.startedAt >= thirtyDaysAgo);
    
    const removedCount = sessions.length - filtered.length;
    if (removedCount > 0) {
      sessionsStore.set('sessions', filtered);
    }
    
    return removedCount;
  },
};
