import { powerMonitor, BrowserWindow } from 'electron';
import { handlePowerResume } from './ipc';

export function setupPowerMonitor(): void {
  // Handle system suspend
  powerMonitor.on('suspend', () => {
    console.log('System is going to sleep');
    // We don't need to do anything special on suspend
    // The timer will continue to track the end time
  });

  // Handle system resume
  powerMonitor.on('resume', () => {
    console.log('System has woken up');
    
    // Update timer state based on elapsed time
    handlePowerResume();
    
    // Notify all renderer processes
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(window => {
      window.webContents.send('power:resumed');
    });
  });

  // Handle lock screen (optional)
  powerMonitor.on('lock-screen', () => {
    console.log('Screen locked');
  });

  // Handle unlock screen (optional)
  powerMonitor.on('unlock-screen', () => {
    console.log('Screen unlocked');
  });

  // Handle shutdown (optional - for cleanup)
  powerMonitor.on('shutdown', () => {
    console.log('System is shutting down');
  });
}
