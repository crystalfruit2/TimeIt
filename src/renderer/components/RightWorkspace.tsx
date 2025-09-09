import React from 'react';
import { useActiveTask, useIsTimerActive } from '../state/selectors';
import TimerBubbles from './TimerBubbles';
import ActiveTimer from './ActiveTimer';
import CycleTracker from './CycleTracker';
import SessionHistory from './SessionHistory';
import MiniTimerToggle from './MiniTimerToggle';
import CompletionNotification from './CompletionNotification';

const RightWorkspace: React.FC = () => {
  const activeTask = useActiveTask();
  const isTimerActive = useIsTimerActive();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
            {activeTask?.name || 'Select a task to get started'}
          </h1>
          {activeTask?.type && (
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {activeTask.type.replace('_', ' ')}
            </p>
          )}
        </div>
        
        <div className="ml-4 flex items-center space-x-2">
          <MiniTimerToggle />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {!activeTask ? (
          /* No task selected state */
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⏱️</div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Welcome to TimeIt
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Create and select a task from the left panel to start your Pomodoro session.
              </p>
            </div>
          </div>
        ) : (
          /* Active task content */
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Timer section */}
            <div className="text-center">
              {isTimerActive ? (
                <ActiveTimer />
              ) : (
                <TimerBubbles />
              )}
            </div>

            {/* Cycle tracker */}
            <div className="flex justify-center">
              <CycleTracker />
            </div>

            {/* Session history */}
            <div>
              <SessionHistory />
            </div>
          </div>
        )}
      </div>

      {/* Completion notification */}
      <CompletionNotification />
    </div>
  );
};

export default RightWorkspace;
