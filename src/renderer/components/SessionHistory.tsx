import React, { useEffect } from 'react';
import { useTimerStore } from '../state/useTimerStore';
import { useTodaySessions, useSessionStats, useActiveTask } from '../state/selectors';

const SessionHistory: React.FC = () => {
  const activeTask = useActiveTask();
  const sessions = useTodaySessions();
  const stats = useSessionStats();
  const { loadTodaySessions } = useTimerStore();

  // Load sessions when active task changes
  useEffect(() => {
    if (activeTask) {
      loadTodaySessions(activeTask.id);
    }
  }, [activeTask, loadTodaySessions]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!activeTask) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Today's Sessions
        </h3>
        
        {/* Session stats */}
        {stats.totalSessions > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {stats.workSessionCount} work • {stats.breakSessionCount} break • {formatDuration(stats.totalWorkTime)} total
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>No sessions yet today.</p>
          <p className="text-sm mt-1">Start a timer to see your progress here.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className={`session-item ${
                session.kind === 'work' ? 'session-item-work' : 'session-item-break'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  session.kind === 'work' ? 'bg-work-500' : 'bg-break-500'
                }`} />
                <div>
                  <div className="font-medium capitalize">
                    {session.kind === 'work' ? 'Work Session' : 'Break'} {sessions.filter(s => s.kind === session.kind).length - index}
                  </div>
                  <div className="text-xs opacity-75">
                    {formatTime(session.startedAt)} - {formatTime(session.endedAt)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">
                  {session.plannedMinutes}m
                </div>
                <div className="text-xs opacity-75">
                  {Math.round((session.endedAt - session.startedAt) / 60000)}m actual
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily summary */}
      {stats.totalSessions > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-work-600 dark:text-work-400">
                {stats.workSessionCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Work Sessions
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-break-600 dark:text-break-400">
                {stats.breakSessionCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Breaks
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatDuration(stats.totalWorkTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Focus Time
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
