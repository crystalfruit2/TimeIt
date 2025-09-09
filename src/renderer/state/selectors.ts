import { useTasksStore } from './useTasksStore';
import { useTimerStore } from './useTimerStore';
import { Session } from '../../../packages/shared/src/types';

// Task selectors
export const useActiveTask = () => {
  return useTasksStore((state) => state.getActiveTask());
};

export const useFilteredTasks = () => {
  return useTasksStore((state) => state.getFilteredTasks());
};

export const useTasksLoading = () => {
  return useTasksStore((state) => state.loading);
};

export const useTasksError = () => {
  return useTasksStore((state) => state.error);
};

// Timer selectors
export const useTimerState = () => {
  return useTimerStore((state) => ({
    mode: state.mode,
    kind: state.kind,
    remainingMs: state.remainingMs,
    plannedMinutes: state.plannedMinutes,
    completedWorkCount: state.completedWorkCount,
    activeTaskId: state.activeTaskId,
  }));
};

export const useFormattedTime = () => {
  return useTimerStore((state) => state.getFormattedTime());
};

export const useTimerProgress = () => {
  return useTimerStore((state) => state.getProgressPercentage());
};

export const useIsTimerActive = () => {
  return useTimerStore((state) => state.mode !== 'idle');
};

export const useCanStartTimer = () => {
  const activeTask = useActiveTask();
  const timerState = useTimerStore((state) => state.mode);
  return activeTask !== null && timerState === 'idle';
};

export const useShouldShowBreakOptions = () => {
  return useTimerStore((state) => state.shouldShowBreakOptions());
};

// Session selectors
export const useTodaySessions = () => {
  return useTimerStore((state) => state.todaySessions);
};

export const useSessionStats = () => {
  return useTimerStore((state) => {
    const sessions = state.todaySessions;
    const workSessions = sessions.filter(s => s.kind === 'work');
    const breakSessions = sessions.filter(s => s.kind === 'break');
    
    const totalWorkTime = workSessions.reduce((total, session) => {
      return total + session.plannedMinutes;
    }, 0);
    
    const totalBreakTime = breakSessions.reduce((total, session) => {
      return total + session.plannedMinutes;
    }, 0);
    
    return {
      workSessionCount: workSessions.length,
      breakSessionCount: breakSessions.length,
      totalWorkTime,
      totalBreakTime,
      totalSessions: sessions.length,
    };
  });
};

// Combined selectors
export const useCanStartWork = () => {
  const activeTask = useActiveTask();
  const timerMode = useTimerStore((state) => state.mode);
  return activeTask !== null && timerMode === 'idle';
};

export const useCanStartBreak = () => {
  const shouldShow = useShouldShowBreakOptions();
  const timerMode = useTimerStore((state) => state.mode);
  return shouldShow && timerMode === 'idle';
};

// Notification selectors
export const useLastNotification = () => {
  return useTimerStore((state) => state.lastNotification);
};

// Error selectors
export const useErrors = () => {
  const tasksError = useTasksStore((state) => state.error);
  const timerError = useTimerStore((state) => state.error);
  
  return {
    tasksError,
    timerError,
    hasAnyError: Boolean(tasksError || timerError),
  };
};
