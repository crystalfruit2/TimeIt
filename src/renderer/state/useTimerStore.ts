import { create } from 'zustand';
import { TimerState, SessionKind, Session, TimerTickEvent, TimerCompletedEvent } from '../../../packages/shared/src/types';

interface TimerStoreState extends TimerState {
  // Additional UI state
  isInitialized: boolean;
  error: string | null;
  
  // Session history
  todaySessions: Session[];
  
  // Notification state
  lastNotification: TimerCompletedEvent | null;
}

interface TimerActions {
  // Initialization
  initialize: () => Promise<void>;
  
  // Timer operations
  startTimer: (taskId: string, kind: SessionKind, minutes: number) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  
  // Session history
  loadTodaySessions: (taskId?: string) => Promise<void>;
  
  // Event handlers
  handleTimerTick: (event: TimerTickEvent) => void;
  handleTimerCompleted: (event: TimerCompletedEvent) => void;
  handlePowerResume: () => void;
  
  // Tray commands
  handleTrayCommand: (command: 'pause' | 'resume' | 'stop' | 'start-last') => Promise<void>;
  
  // Shortcuts
  handleToggleTimer: () => Promise<void>;
  
  // Computed
  getFormattedTime: () => string;
  getProgressPercentage: () => number;
  shouldShowBreakOptions: () => boolean;
  
  // Clear notification
  clearNotification: () => void;
}

type TimerStore = TimerStoreState & TimerActions;

// Helper to format milliseconds to MM:SS
function formatTime(ms: number): string {
  if (ms <= 0) return '00:00';
  
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Initial state
  activeTaskId: null,
  mode: 'idle',
  kind: null,
  endsAt: null,
  remainingMs: 0,
  plannedMinutes: null,
  completedWorkCount: 0,
  isInitialized: false,
  error: null,
  todaySessions: [],
  lastNotification: null,

  // Initialization
  initialize: async () => {
    try {
      const timerState = await window.electronAPI.timer.getState();
      set({ 
        ...timerState, 
        isInitialized: true, 
        error: null 
      });

      // Set up event listeners
      const { handleTimerTick, handleTimerCompleted, handlePowerResume } = get();
      
      window.electronAPI.on('timer:tick', handleTimerTick);
      window.electronAPI.on('timer:completed', handleTimerCompleted);
      window.electronAPI.on('power:resumed', handlePowerResume);
      
      // Set up tray command listeners
      const { handleTrayCommand } = get();
      window.electronAPI.on('tray:pause', () => handleTrayCommand('pause'));
      window.electronAPI.on('tray:resume', () => handleTrayCommand('resume'));
      window.electronAPI.on('tray:stop', () => handleTrayCommand('stop'));
      window.electronAPI.on('tray:start-last', () => handleTrayCommand('start-last'));
      
      // Set up shortcut listeners
      const { handleToggleTimer } = get();
      window.electronAPI.on('shortcut:toggle-timer', handleToggleTimer);
      
    } catch (error) {
      set({ error: 'Failed to initialize timer', isInitialized: false });
      console.error('Timer initialization failed:', error);
    }
  },

  // Timer operations
  startTimer: async (taskId: string, kind: SessionKind, minutes: number) => {
    try {
      await window.electronAPI.timer.start({ taskId, kind, minutes });
      set({ error: null });
    } catch (error) {
      set({ error: 'Failed to start timer' });
      console.error('Failed to start timer:', error);
    }
  },

  pauseTimer: async () => {
    try {
      await window.electronAPI.timer.pause();
      set({ error: null });
    } catch (error) {
      set({ error: 'Failed to pause timer' });
      console.error('Failed to pause timer:', error);
    }
  },

  resumeTimer: async () => {
    try {
      await window.electronAPI.timer.resume();
      set({ error: null });
    } catch (error) {
      set({ error: 'Failed to resume timer' });
      console.error('Failed to resume timer:', error);
    }
  },

  stopTimer: async () => {
    try {
      await window.electronAPI.timer.stop();
      set({ error: null });
    } catch (error) {
      set({ error: 'Failed to stop timer' });
      console.error('Failed to stop timer:', error);
    }
  },

  // Session history
  loadTodaySessions: async (taskId?: string) => {
    try {
      const sessions = await window.electronAPI.sessions.getToday(taskId);
      set({ todaySessions: sessions });
    } catch (error) {
      console.error('Failed to load today sessions:', error);
    }
  },

  // Event handlers
  handleTimerTick: (event: TimerTickEvent) => {
    set({
      remainingMs: event.remainingMs,
      endsAt: event.endsAt,
    });
  },

  handleTimerCompleted: (event: TimerCompletedEvent) => {
    set({
      lastNotification: event,
      mode: 'idle',
      kind: null,
      endsAt: null,
      remainingMs: 0,
      plannedMinutes: null,
    });

    // Show browser notification
    if (window.Notification && Notification.permission === 'granted') {
      const title = event.kind === 'work' ? 'Work Session Complete!' : 'Break Complete!';
      const body = `${event.plannedMinutes} minute ${event.kind} session finished.`;
      
      new Notification(title, {
        body,
        icon: '/icon.png', // Add an icon if available
        tag: 'timer-complete',
      });
    }

    // Reload today's sessions to show the new completed session
    const { activeTaskId, loadTodaySessions } = get();
    if (activeTaskId) {
      loadTodaySessions(activeTaskId);
    }
  },

  handlePowerResume: () => {
    // Re-initialize to get the updated state after power resume
    const { initialize } = get();
    initialize();
  },

  // Tray commands
  handleTrayCommand: async (command: 'pause' | 'resume' | 'stop' | 'start-last') => {
    const { mode, pauseTimer, resumeTimer, stopTimer } = get();
    
    switch (command) {
      case 'pause':
        if (mode === 'running') await pauseTimer();
        break;
      case 'resume':
        if (mode === 'paused') await resumeTimer();
        break;
      case 'stop':
        if (mode !== 'idle') await stopTimer();
        break;
      case 'start-last':
        // For MVP, we'll just trigger a start with default 25 minutes
        // This would ideally remember the last used settings
        const state = get();
        if (state.activeTaskId && state.mode === 'idle') {
          await get().startTimer(state.activeTaskId, 'work', 25);
        }
        break;
    }
  },

  // Shortcuts
  handleToggleTimer: async () => {
    const { mode, pauseTimer, resumeTimer } = get();
    
    if (mode === 'running') {
      await pauseTimer();
    } else if (mode === 'paused') {
      await resumeTimer();
    }
    // If idle, we don't do anything without an active task
  },

  // Computed
  getFormattedTime: () => {
    const { remainingMs } = get();
    return formatTime(remainingMs);
  },

  getProgressPercentage: () => {
    const { remainingMs, plannedMinutes } = get();
    if (!plannedMinutes) return 0;
    
    const totalMs = plannedMinutes * 60 * 1000;
    const elapsedMs = totalMs - remainingMs;
    return Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
  },

  shouldShowBreakOptions: () => {
    const { completedWorkCount } = get();
    return completedWorkCount > 0;
  },

  // Clear notification
  clearNotification: () => {
    set({ lastNotification: null });
  },
}));
