import React from 'react';
import { useTimerState, useFormattedTime, useTimerProgress } from '../state/selectors';
import { useTimerStore } from '../state/useTimerStore';

const ActiveTimer: React.FC = () => {
  const { mode, kind, plannedMinutes } = useTimerState();
  const formattedTime = useFormattedTime();
  const progress = useTimerProgress();
  const { pauseTimer, resumeTimer, stopTimer } = useTimerStore();

  const handleToggleTimer = async () => {
    if (mode === 'running') {
      await pauseTimer();
    } else if (mode === 'paused') {
      await resumeTimer();
    }
  };

  const handleStopTimer = async () => {
    await stopTimer();
  };

  const getTimerColor = () => {
    return kind === 'work' ? 'work' : 'break';
  };

  const getTimerIcon = () => {
    if (mode === 'running') return '⏸️';
    if (mode === 'paused') return '▶️';
    return '⏹️';
  };

  const getTimerStatus = () => {
    if (mode === 'paused') return `${kind} session paused`;
    return `${kind} session running`;
  };

  return (
    <div className="space-y-6">
      {/* Timer circle with progress */}
      <div className="relative flex items-center justify-center">
        {/* Background circle */}
        <div className="w-64 h-64 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
        
        {/* Progress circle */}
        <svg className="absolute w-64 h-64 transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
            className={`transition-all duration-1000 ${
              getTimerColor() === 'work' 
                ? 'text-work-500' 
                : 'text-break-500'
            }`}
            strokeLinecap="round"
          />
        </svg>

        {/* Timer content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white mb-2">
            {formattedTime}
          </div>
          <div className={`text-lg font-medium capitalize ${
            getTimerColor() === 'work' 
              ? 'text-work-600 dark:text-work-400' 
              : 'text-break-600 dark:text-break-400'
          }`}>
            {getTimerStatus()}
          </div>
          {plannedMinutes && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {plannedMinutes} minute session
            </div>
          )}
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleToggleTimer}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
            getTimerColor() === 'work'
              ? 'bg-work-500 hover:bg-work-600 focus:ring-work-500'
              : 'bg-break-500 hover:bg-break-600 focus:ring-break-500'
          }`}
          title={mode === 'running' ? 'Pause timer' : 'Resume timer'}
        >
          {getTimerIcon()}
        </button>

        <button
          onClick={handleStopTimer}
          className="w-16 h-16 rounded-full bg-gray-500 hover:bg-gray-600 text-white text-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50"
          title="Stop timer"
        >
          ⏹️
        </button>
      </div>

      {/* Progress indicator */}
      <div className="max-w-xs mx-auto">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              getTimerColor() === 'work' 
                ? 'bg-work-500' 
                : 'bg-break-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+Shift+T</kbd> to pause/resume</p>
      </div>
    </div>
  );
};

export default ActiveTimer;
