import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';
import { showMainWindow, toggleMiniWindow } from './windows';

let tray: Tray | null = null;

// Format time for display
function formatTime(ms: number): string {
  if (ms <= 0) return 'Idle';
  
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `0:${seconds.toString().padStart(2, '0')}`;
  }
}

export function createTray(): Tray {
  // Create tray icon
  // For now, we'll use a simple text-based icon
  // In production, you'd want to use proper icon files
  const icon = nativeImage.createEmpty();
  
  tray = new Tray(icon);
  tray.setToolTip('TimeIt - Pomodoro Timer');
  
  updateTrayMenu('Idle', 'idle');
  
  // Handle tray click
  tray.on('click', () => {
    showMainWindow();
  });
  
  return tray;
}

export function updateTrayMenu(timeText: string, mode: 'idle' | 'running' | 'paused'): void {
  if (!tray) return;

  // Update tray title/tooltip
  tray.setToolTip(`TimeIt - ${timeText}`);
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: timeText,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: mode === 'running' ? 'Pause' : mode === 'paused' ? 'Resume' : 'Start Last',
      enabled: true,
      click: () => {
        if (mode === 'running') {
          // Send pause command
          const mainWindow = require('./windows').getMainWindow();
          if (mainWindow) {
            mainWindow.webContents.send('tray:pause');
          }
        } else if (mode === 'paused') {
          // Send resume command
          const mainWindow = require('./windows').getMainWindow();
          if (mainWindow) {
            mainWindow.webContents.send('tray:resume');
          }
        } else {
          // Start last preset - this will be handled by the renderer
          const mainWindow = require('./windows').getMainWindow();
          if (mainWindow) {
            mainWindow.webContents.send('tray:start-last');
          }
        }
      },
    },
    {
      label: 'Stop',
      enabled: mode !== 'idle',
      click: () => {
        const mainWindow = require('./windows').getMainWindow();
        if (mainWindow) {
          mainWindow.webContents.send('tray:stop');
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Toggle Mini Timer',
      click: () => {
        toggleMiniWindow();
      },
    },
    {
      label: 'Open TimeIt',
      click: () => {
        showMainWindow();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function updateTrayTimer(remainingMs: number, mode: 'idle' | 'running' | 'paused'): void {
  const timeText = formatTime(remainingMs);
  updateTrayMenu(timeText, mode);
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

export function getTray(): Tray | null {
  return tray;
}
