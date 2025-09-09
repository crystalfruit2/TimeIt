import React from 'react';
import LeftHub from '../components/LeftHub';
import RightWorkspace from '../components/RightWorkspace';
import { useErrors } from '../state/selectors';

const MainWindow: React.FC = () => {
  const { hasAnyError, tasksError, timerError } = useErrors();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Error notifications */}
      {hasAnyError && (
        <div className="absolute top-4 right-4 z-50 space-y-2">
          {tasksError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-sm">
              <div className="flex">
                <div>
                  <p className="font-bold">Tasks Error</p>
                  <p className="text-sm">{tasksError}</p>
                </div>
              </div>
            </div>
          )}
          {timerError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-sm">
              <div className="flex">
                <div>
                  <p className="font-bold">Timer Error</p>
                  <p className="text-sm">{timerError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Left Panel - Task Hub */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <LeftHub />
      </div>

      {/* Right Panel - Workspace */}
      <div className="flex-1 flex flex-col">
        <RightWorkspace />
      </div>
    </div>
  );
};

export default MainWindow;
