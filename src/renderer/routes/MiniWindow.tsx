import React from 'react';
import { useActiveTask, useTimerState, useFormattedTime } from '../state/selectors';
import { useTimerStore } from '../state/useTimerStore';

const MiniWindow: React.FC = () => {
  const activeTask = useActiveTask();
  const { mode, kind } = useTimerState();
  const formattedTime = useFormattedTime();
  const { pauseTimer, resumeTimer } = useTimerStore();

  const handleToggleTimer = async () => {
    if (mode === 'running') {
      await pauseTimer();
    } else if (mode === 'paused') {
      await resumeTimer();
    }
  };

  const handleOpenFullApp = async () => {
    await window.electronAPI.app.toggleMini(); // Close mini window
    // The main window should already be open, just focus it
  };

  const getTimerIcon = () => {
    if (mode === 'running') {
      return '⏸️';
    } else if (mode === 'paused') {
      return '▶️';
    }
    return '⏱️';
  };

  const getTimerStatus = () => {
    if (mode === 'idle') return 'Idle';
    if (mode === 'paused') return `${kind} Paused`;
    return `${kind} Running`;
  };

  return (
    <div className="mini-window w-full h-full p-3">
      {/* Draggable header */}
      <div 
        data-draggable 
        className="draggable flex items-center justify-between mb-2 cursor-move"
      >
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          TimeIt
        </div>
        <button
          onClick={handleOpenFullApp}
          className="non-draggable text-xs text-primary-600 hover:text-primary-700 transition-colors"
        >
          Open Full App
        </button>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Task name */}
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {activeTask?.name || 'No active task'}
          </div>
          
          {/* Timer status and time */}
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getTimerStatus()}
            </span>
            <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Timer control button */}
        <button
          onClick={handleToggleTimer}
          disabled={mode === 'idle'}
          className="non-draggable ml-3 w-10 h-10 flex items-center justify-center rounded-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
        >
          <span className="text-lg">{getTimerIcon()}</span>
        </button>
      </div>
    </div>
  );
};

export default MiniWindow;
