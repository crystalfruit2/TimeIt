import React from 'react';

const MiniTimerToggle: React.FC = () => {
  const handleToggleMini = async () => {
    try {
      await window.electronAPI.app.toggleMini();
    } catch (error) {
      console.error('Failed to toggle mini window:', error);
    }
  };

  return (
    <button
      onClick={handleToggleMini}
      className="btn btn-secondary btn-sm"
      title="Toggle mini timer window (Ctrl+Shift+M)"
    >
      <svg 
        className="w-4 h-4 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
      Mini Timer
    </button>
  );
};

export default MiniTimerToggle;
