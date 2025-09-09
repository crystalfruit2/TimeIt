import React, { useEffect } from 'react';
import { useTimerStore } from './state/useTimerStore';
import { useTasksStore } from './state/useTasksStore';
import MainWindow from './routes/MainWindow';
import MiniWindow from './routes/MiniWindow';

// Check if we're in mini mode based on URL params
const isMiniMode = (): boolean => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('mini') === 'true';
  }
  return false;
};

const App: React.FC = () => {
  const initializeTimer = useTimerStore((state) => state.initialize);
  const loadTasks = useTasksStore((state) => state.loadTasks);

  useEffect(() => {
    // Initialize stores
    const initializeApp = async () => {
      try {
        await Promise.all([
          initializeTimer(),
          loadTasks(),
        ]);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [initializeTimer, loadTasks]);

  // Render different components based on mode
  if (isMiniMode()) {
    return <MiniWindow />;
  }

  return <MainWindow />;
};

export default App;
