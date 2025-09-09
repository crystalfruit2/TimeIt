export type TaskType = "project" | "study_group";

export interface Task {
  id: string;             // uuid
  name: string;
  type?: TaskType;         // optional; MVP treats equally
  createdAt: number;
  archived?: boolean;
}

export type SessionKind = "work" | "break";

export interface Session {
  id: string;
  taskId: string;
  kind: SessionKind;
  startedAt: number;       // epoch ms
  endedAt: number;         // epoch ms
  plannedMinutes: number;  // bubble chosen
}

export interface TimerState {
  activeTaskId: string | null;
  mode: "idle" | "running" | "paused";
  kind: SessionKind | null;
  endsAt: number | null;     // epoch ms
  remainingMs: number;       // derived in renderer for UI
  plannedMinutes: number | null;
  completedWorkCount: number; // today
}

export interface Settings {
  workDuration: number;      // default work session minutes
  shortBreakDuration: number; // default short break minutes
  longBreakDuration: number;  // default long break minutes
  longBreakInterval: number;  // every N work sessions
  soundEnabled: boolean;
  launchAtLogin: boolean;
}

// IPC API types
export interface IpcApi {
  // Timer operations
  timer: {
    start: (params: { taskId: string; kind: SessionKind; minutes: number }) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    stop: () => Promise<void>;
    getState: () => Promise<TimerState>;
  };
  
  // Task operations
  tasks: {
    getAll: () => Promise<Task[]>;
    create: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
    update: (id: string, updates: Partial<Task>) => Promise<Task>;
    delete: (id: string) => Promise<void>;
  };
  
  // Session operations
  sessions: {
    getToday: (taskId?: string) => Promise<Session[]>;
    getAll: () => Promise<Session[]>;
  };
  
  // Settings operations
  settings: {
    get: () => Promise<Settings>;
    update: (updates: Partial<Settings>) => Promise<Settings>;
  };
  
  // App operations
  app: {
    toggleMini: () => Promise<void>;
    quit: () => Promise<void>;
  };
  
  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

// Timer events from main to renderer
export interface TimerTickEvent {
  remainingMs: number;
  endsAt: number;
}

export interface TimerCompletedEvent {
  kind: SessionKind;
  plannedMinutes: number;
}
