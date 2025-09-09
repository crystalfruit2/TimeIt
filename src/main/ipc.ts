import { ipcMain, BrowserWindow } from 'electron';
import { taskOperations, sessionOperations, settingsOperations, storeUtils } from './store';
import { TimerState, SessionKind, Task, Session, Settings } from '../../packages/shared/src/types';

// Timer state management
let timerState: TimerState = {
  activeTaskId: null,
  mode: 'idle',
  kind: null,
  endsAt: null,
  remainingMs: 0,
  plannedMinutes: null,
  completedWorkCount: 0,
};

let timerInterval: NodeJS.Timeout | null = null;
let currentSessionStartTime: number | null = null;

// Helper to broadcast timer updates to all windows
function broadcastTimerUpdate() {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach(window => {
    window.webContents.send('timer:tick', {
      remainingMs: timerState.remainingMs,
      endsAt: timerState.endsAt,
    });
  });
}

// Helper to complete a timer session
function completeTimerSession() {
  if (!timerState.activeTaskId || !timerState.kind || !timerState.plannedMinutes || !currentSessionStartTime) {
    return;
  }

  // Create session record
  const session = sessionOperations.create({
    taskId: timerState.activeTaskId,
    kind: timerState.kind,
    startedAt: currentSessionStartTime,
    endedAt: Date.now(),
    plannedMinutes: timerState.plannedMinutes,
  });

  // Update completed work count if it was a work session
  if (timerState.kind === 'work') {
    timerState.completedWorkCount = storeUtils.getTodayWorkSessionCount(timerState.activeTaskId);
  }

  // Broadcast completion event
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach(window => {
    window.webContents.send('timer:completed', {
      kind: timerState.kind,
      plannedMinutes: timerState.plannedMinutes,
    });
  });

  // Reset timer state
  stopTimer();
}

// Timer management functions
function startTimer(taskId: string, kind: SessionKind, minutes: number) {
  // Stop any existing timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Set up new timer state
  const now = Date.now();
  timerState = {
    activeTaskId: taskId,
    mode: 'running',
    kind,
    endsAt: now + (minutes * 60 * 1000),
    remainingMs: minutes * 60 * 1000,
    plannedMinutes: minutes,
    completedWorkCount: storeUtils.getTodayWorkSessionCount(taskId),
  };
  
  currentSessionStartTime = now;

  // Start the countdown interval
  timerInterval = setInterval(() => {
    const now = Date.now();
    const remaining = timerState.endsAt! - now;

    if (remaining <= 0) {
      // Timer completed
      timerState.remainingMs = 0;
      broadcastTimerUpdate();
      completeTimerSession();
    } else {
      // Update remaining time
      timerState.remainingMs = remaining;
      broadcastTimerUpdate();
    }
  }, 1000);

  // Initial broadcast
  broadcastTimerUpdate();
}

function pauseTimer() {
  if (timerState.mode !== 'running') return;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timerState.mode = 'paused';
  broadcastTimerUpdate();
}

function resumeTimer() {
  if (timerState.mode !== 'paused' || !timerState.endsAt) return;

  // Recalculate end time based on remaining time
  const now = Date.now();
  timerState.endsAt = now + timerState.remainingMs;
  timerState.mode = 'running';

  // Restart the interval
  timerInterval = setInterval(() => {
    const now = Date.now();
    const remaining = timerState.endsAt! - now;

    if (remaining <= 0) {
      timerState.remainingMs = 0;
      broadcastTimerUpdate();
      completeTimerSession();
    } else {
      timerState.remainingMs = remaining;
      broadcastTimerUpdate();
    }
  }, 1000);

  broadcastTimerUpdate();
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timerState = {
    activeTaskId: null,
    mode: 'idle',
    kind: null,
    endsAt: null,
    remainingMs: 0,
    plannedMinutes: null,
    completedWorkCount: timerState.completedWorkCount, // Keep the count
  };

  currentSessionStartTime = null;
  broadcastTimerUpdate();
}

// Power monitor handling (for suspend/resume)
export function handlePowerResume() {
  if (timerState.mode === 'running' && timerState.endsAt) {
    const now = Date.now();
    if (now >= timerState.endsAt) {
      // Timer should have completed while asleep
      timerState.remainingMs = 0;
      completeTimerSession();
    } else {
      // Update remaining time and continue
      timerState.remainingMs = timerState.endsAt - now;
      broadcastTimerUpdate();
    }
  }
}

// IPC Handlers
export function setupIpcHandlers() {
  // Timer handlers
  ipcMain.handle('timer:start', async (_, params: { taskId: string; kind: SessionKind; minutes: number }) => {
    startTimer(params.taskId, params.kind, params.minutes);
  });

  ipcMain.handle('timer:pause', async () => {
    pauseTimer();
  });

  ipcMain.handle('timer:resume', async () => {
    resumeTimer();
  });

  ipcMain.handle('timer:stop', async () => {
    stopTimer();
  });

  ipcMain.handle('timer:getState', async (): Promise<TimerState> => {
    return timerState;
  });

  // Task handlers
  ipcMain.handle('tasks:getAll', async (): Promise<Task[]> => {
    return taskOperations.getAll();
  });

  ipcMain.handle('tasks:create', async (_, task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    return taskOperations.create(task);
  });

  ipcMain.handle('tasks:update', async (_, id: string, updates: Partial<Task>): Promise<Task | null> => {
    return taskOperations.update(id, updates);
  });

  ipcMain.handle('tasks:delete', async (_, id: string): Promise<void> => {
    taskOperations.delete(id);
  });

  // Session handlers
  ipcMain.handle('sessions:getToday', async (_, taskId?: string): Promise<Session[]> => {
    return sessionOperations.getToday(taskId);
  });

  ipcMain.handle('sessions:getAll', async (): Promise<Session[]> => {
    return sessionOperations.getAll();
  });

  // Settings handlers
  ipcMain.handle('settings:get', async (): Promise<Settings> => {
    return settingsOperations.get();
  });

  ipcMain.handle('settings:update', async (_, updates: Partial<Settings>): Promise<Settings> => {
    return settingsOperations.update(updates);
  });

  // App handlers will be implemented in main.ts
}
