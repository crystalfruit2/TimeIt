import React from 'react';
import { useLastNotification } from '../state/selectors';
import { useTimerStore } from '../state/useTimerStore';

const CompletionNotification: React.FC = () => {
  const notification = useLastNotification();
  const { clearNotification, startTimer } = useTimerStore();
  const { activeTaskId } = useTimerStore();

  if (!notification || !activeTaskId) {
    return null;
  }

  const handleStartNext = async () => {
    // Start the opposite type of session
    const nextKind = notification.kind === 'work' ? 'break' : 'work';
    const duration = nextKind === 'work' ? 25 : 5; // Default durations
    
    await startTimer(activeTaskId, nextKind, duration);
    clearNotification();
  };

  const handleAddFiveMin = async () => {
    // Start another session of the same type with 5 more minutes
    await startTimer(activeTaskId, notification.kind, 5);
    clearNotification();
  };

  const handleSnooze = () => {
    // For MVP, we'll just dismiss the notification
    // In a full implementation, this could set a 2-minute reminder
    clearNotification();
    setTimeout(() => {
      // Re-show notification after 2 minutes
      // This would need more sophisticated state management
    }, 2 * 60 * 1000);
  };

  const handleDismiss = () => {
    clearNotification();
  };

  const getNotificationTitle = () => {
    return notification.kind === 'work' 
      ? '🎉 Work Session Complete!' 
      : '✨ Break Complete!';
  };

  const getNotificationMessage = () => {
    return `${notification.plannedMinutes} minute ${notification.kind} session finished.`;
  };

  const getNextAction = () => {
    return notification.kind === 'work' ? 'Start Break' : 'Start Work';
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 fade-in">
      <div className="flex items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {getNotificationTitle()}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getNotificationMessage()}
          </p>
        </div>
        
        <button
          onClick={handleDismiss}
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleStartNext}
          className="btn btn-primary btn-sm flex-1"
        >
          {getNextAction()}
        </button>
        
        <button
          onClick={handleAddFiveMin}
          className="btn btn-secondary btn-sm"
          title="Add 5 more minutes"
        >
          +5 min
        </button>
        
        <button
          onClick={handleSnooze}
          className="btn btn-secondary btn-sm"
          title="Snooze for 2 minutes"
        >
          Snooze
        </button>
      </div>
    </div>
  );
};

export default CompletionNotification;
