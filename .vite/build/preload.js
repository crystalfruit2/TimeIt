"use strict";
const electron = require("electron");
const api = {
  timer: {
    start: (params) => electron.ipcRenderer.invoke("timer:start", params),
    pause: () => electron.ipcRenderer.invoke("timer:pause"),
    resume: () => electron.ipcRenderer.invoke("timer:resume"),
    stop: () => electron.ipcRenderer.invoke("timer:stop"),
    getState: () => electron.ipcRenderer.invoke("timer:getState")
  },
  tasks: {
    getAll: () => electron.ipcRenderer.invoke("tasks:getAll"),
    create: (task) => electron.ipcRenderer.invoke("tasks:create", task),
    update: (id, updates) => electron.ipcRenderer.invoke("tasks:update", id, updates),
    delete: (id) => electron.ipcRenderer.invoke("tasks:delete", id)
  },
  sessions: {
    getToday: (taskId) => electron.ipcRenderer.invoke("sessions:getToday", taskId),
    getAll: () => electron.ipcRenderer.invoke("sessions:getAll")
  },
  settings: {
    get: () => electron.ipcRenderer.invoke("settings:get"),
    update: (updates) => electron.ipcRenderer.invoke("settings:update", updates)
  },
  app: {
    toggleMini: () => electron.ipcRenderer.invoke("app:toggleMini"),
    quit: () => electron.ipcRenderer.invoke("app:quit")
  },
  on: (channel, callback) => {
    electron.ipcRenderer.on(channel, (_, ...args) => callback(...args));
    return () => electron.ipcRenderer.removeListener(channel, callback);
  },
  off: (channel, callback) => {
    electron.ipcRenderer.removeListener(channel, callback);
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", api);
