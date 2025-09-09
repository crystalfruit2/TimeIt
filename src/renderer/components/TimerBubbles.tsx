import React, { useState } from 'react';
import { useActiveTask, useCanStartWork, useCanStartBreak } from '../state/selectors';
import { useTimerStore } from '../state/useTimerStore';

const TimerBubbles: React.FC = () => {
  const activeTask = useActiveTask();
  const canStartWork = useCanStartWork();
  const canStartBreak = useCanStartBreak();
  const { startTimer } = useTimerStore();

  const [showBreakOptions, setShowBreakOptions] = useState(false);

  const workPresets = [5, 15, 25, 45, 55];
  const breakPresets = [5, 15];

  const handleWorkBubbleClick = async (minutes: number) => {
    if (!activeTask || !canStartWork) return;
    
    await startTimer(activeTask.id, 'work', minutes);
  };

  const handleBreakBubbleClick = async (minutes: number) => {
    if (!activeTask || !canStartBreak) return;
    
    await startTimer(activeTask.id, 'break', minutes);
    setShowBreakOptions(false);
  };

  const toggleBreakOptions = () => {
    if (canStartBreak) {
      setShowBreakOptions(!showBreakOptions);
    }
  };

  return (
    <div className="space-y-6">
      {/* Work session bubbles */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">
          Work Sessions
        </h3>
        <div className="flex justify-center items-center space-x-4">
          {workPresets.map((minutes) => (
            <button
              key={minutes}
              onClick={() => handleWorkBubbleClick(minutes)}
              disabled={!canStartWork}
              className="timer-bubble timer-bubble-work"
              title={`Start ${minutes} minute work session`}
            >
              {minutes}
            </button>
          ))}
        </div>
        {!canStartWork && activeTask && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            Timer is currently running
          </p>
        )}
        {!activeTask && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            Select a task to start a work session
          </p>
        )}
      </div>

      {/* Break section */}
      <div>
        <div className="flex justify-center">
          <button
            onClick={toggleBreakOptions}
            disabled={!canStartBreak}
            className={`timer-bubble ${
              canStartBreak 
                ? 'timer-bubble-break' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            title={canStartBreak ? 'Show break options' : 'Complete a work session first'}
          >
            Break
          </button>
        </div>

        {!canStartBreak && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            Complete a work session to unlock breaks
          </p>
        )}

        {/* Break options */}
        {showBreakOptions && canStartBreak && (
          <div className="mt-4 flex justify-center space-x-4 fade-in">
            {breakPresets.map((minutes) => (
              <button
                key={minutes}
                onClick={() => handleBreakBubbleClick(minutes)}
                className="timer-bubble timer-bubble-break"
                title={`Start ${minutes} minute break`}
              >
                {minutes}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        <p>
          Click a number to start a timer session. The break option appears after completing a work session.
        </p>
      </div>
    </div>
  );
};

export default TimerBubbles;
