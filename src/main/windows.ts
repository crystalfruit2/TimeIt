import { BrowserWindow, screen } from 'electron';
import path from 'path';

// Declare the MAIN_WINDOW_VITE_DEV_SERVER_URL and MAIN_WINDOW_VITE_NAME globals
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let miniWindow: BrowserWindow | null = null;

export function createMainWindow(): BrowserWindow {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 800,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'default',
    show: false, // Don't show until ready-to-show
  });

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function createMiniWindow(): BrowserWindow {
  if (miniWindow) {
    // If mini window already exists, focus it
    miniWindow.focus();
    return miniWindow;
  }

  // Get the primary display
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create mini window in top-right corner
  miniWindow = new BrowserWindow({
    width: 280,
    height: 120,
    x: width - 300,
    y: 20,
    resizable: false,
    alwaysOnTop: true,
    frame: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  // Load the same app but with a mini query parameter
  const miniUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL 
    ? `${MAIN_WINDOW_VITE_DEV_SERVER_URL}?mini=true`
    : `file://${path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)}?mini=true`;

  miniWindow.loadURL(miniUrl);

  // Show window when ready
  miniWindow.once('ready-to-show', () => {
    miniWindow?.show();
  });

  // Handle window closed
  miniWindow.on('closed', () => {
    miniWindow = null;
  });

  // Make window draggable
  miniWindow.on('ready-to-show', () => {
    miniWindow?.webContents.executeJavaScript(`
      document.addEventListener('DOMContentLoaded', () => {
        const header = document.querySelector('[data-draggable]');
        if (header) {
          header.style.webkitAppRegion = 'drag';
        }
      });
    `);
  });

  return miniWindow;
}

export function toggleMiniWindow(): void {
  if (miniWindow) {
    miniWindow.close();
    miniWindow = null;
  } else {
    createMiniWindow();
  }
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function getMiniWindow(): BrowserWindow | null {
  return miniWindow;
}

export function showMainWindow(): void {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  } else {
    createMainWindow();
  }
}

export function hideAllWindows(): void {
  if (mainWindow) {
    mainWindow.hide();
  }
  if (miniWindow) {
    miniWindow.hide();
  }
}

export function closeAllWindows(): void {
  if (miniWindow) {
    miniWindow.close();
    miniWindow = null;
  }
  if (mainWindow) {
    mainWindow.close();
    mainWindow = null;
  }
}
