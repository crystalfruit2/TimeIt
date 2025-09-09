import { app, globalShortcut, ipcMain, BrowserWindow } from 'electron';
import { createMainWindow, toggleMiniWindow, showMainWindow, closeAllWindows } from './windows';
import { createTray, destroyTray, updateTrayTimer } from './tray';
import { setupPowerMonitor } from './power';
import { setupIpcHandlers } from './ipc';

// Handle creating/removing shortcuts when Darwin is secure input mode
if (process.platform === 'darwin') {
  app.dock?.hide();
}

// Keep a global reference of the window object
let isQuitting = false;

// Setup IPC handlers
setupIpcHandlers();

// Handle app:toggleMini IPC
ipcMain.handle('app:toggleMini', async () => {
  toggleMiniWindow();
});

// Handle app:quit IPC
ipcMain.handle('app:quit', async () => {
  app.quit();
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Create main window
  createMainWindow();
  
  // Create system tray
  createTray();
  
  // Setup power monitoring
  setupPowerMonitor();
  
  // Register global shortcuts
  registerGlobalShortcuts();
  
  // Listen for timer updates to update tray
  setupTrayUpdates();

  app.on('activate', () => {
    // On macOS it's common to re-create a window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else {
      showMainWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app termination
app.on('before-quit', () => {
  isQuitting = true;
  
  // Unregister global shortcuts
  globalShortcut.unregisterAll();
  
  // Destroy tray
  destroyTray();
  
  // Close all windows
  closeAllWindows();
});

// Prevent app quit when window is closed on macOS
app.on('window-all-closed', (event) => {
  if (process.platform === 'darwin' && !isQuitting) {
    event.preventDefault();
  }
});

function registerGlobalShortcuts(): void {
  try {
    // Start/Pause/Resume shortcut
    globalShortcut.register('CmdOrCtrl+Shift+T', () => {
      const mainWindow = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
      if (mainWindow) {
        mainWindow.webContents.send('shortcut:toggle-timer');
      }
    });

    // Toggle mini timer shortcut
    globalShortcut.register('CmdOrCtrl+Shift+M', () => {
      toggleMiniWindow();
    });

    console.log('Global shortcuts registered successfully');
  } catch (error) {
    console.error('Failed to register global shortcuts:', error);
  }
}

function setupTrayUpdates(): void {
  // Listen for timer state changes and update tray
  const handleTimerUpdate = (event: any, data: { remainingMs: number; endsAt: number }) => {
    // Get current timer mode - we'll need to track this
    // For now, assume running if remainingMs > 0
    const mode = data.remainingMs > 0 ? 'running' : 'idle';
    updateTrayTimer(data.remainingMs, mode);
  };

  // Listen on all windows for timer updates
  const updateTrayListener = () => {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(window => {
      window.webContents.on('ipc-message', (event, channel, ...args) => {
        if (channel === 'timer:tick') {
          handleTimerUpdate(event, args[0]);
        }
      });
    });
  };

  // Set up initial listener
  app.on('browser-window-created', updateTrayListener);
}
