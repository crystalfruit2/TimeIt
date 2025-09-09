import { contextBridge, ipcRenderer } from 'electron';
import { IpcApi, SessionKind } from '../../packages/shared/src/types';

// Create the typed API that will be exposed to the renderer
const api: IpcApi = {
  timer: {
    start: (params) => ipcRenderer.invoke('timer:start', params),
    pause: () => ipcRenderer.invoke('timer:pause'),
    resume: () => ipcRenderer.invoke('timer:resume'),
    stop: () => ipcRenderer.invoke('timer:stop'),
    getState: () => ipcRenderer.invoke('timer:getState'),
  },
  
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:getAll'),
    create: (task) => ipcRenderer.invoke('tasks:create', task),
    update: (id, updates) => ipcRenderer.invoke('tasks:update', id, updates),
    delete: (id) => ipcRenderer.invoke('tasks:delete', id),
  },
  
  sessions: {
    getToday: (taskId) => ipcRenderer.invoke('sessions:getToday', taskId),
    getAll: () => ipcRenderer.invoke('sessions:getAll'),
  },
  
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (updates) => ipcRenderer.invoke('settings:update', updates),
  },
  
  app: {
    toggleMini: () => ipcRenderer.invoke('app:toggleMini'),
    quit: () => ipcRenderer.invoke('app:quit'),
  },
  
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
    return () => ipcRenderer.removeListener(channel, callback);
  },
  
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', api);

// Type declaration for the global window object
declare global {
  interface Window {
    electronAPI: IpcApi;
  }
}
