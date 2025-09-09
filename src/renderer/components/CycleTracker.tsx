import React from 'react';
import { useTimerState } from '../state/selectors';

const CycleTracker: React.FC = () => {
  const { completedWorkCount } = useTimerState();

  // Show 4 dots representing the Pomodoro cycle
  const totalDots = 4;
  const filledDots = completedWorkCount % totalDots;

  return (
    <div className="flex flex-col items-center space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Today's Cycle Progress
      </h4>
      
      <div className="flex space-x-2">
        {Array.from({ length: totalDots }).map((_, index) => (
          <div
            key={index}
            className={`cycle-dot ${
              index < filledDots ? 'cycle-dot-filled' : 'cycle-dot-empty'
            }`}
            title={`Work session ${index + 1}${index < filledDots ? ' completed' : ''}`}
          />
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {filledDots} of {totalDots} work sessions completed
        {filledDots === totalDots && (
          <div className="text-break-600 dark:text-break-400 font-medium mt-1">
            🎉 Cycle complete! Time for a long break.
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleTracker;
