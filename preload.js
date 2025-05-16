const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  convertVideo: (url, format) => ipcRenderer.invoke('convert-video', url, format)
});