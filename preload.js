const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  convertVideo: (url, format, folderPath) => ipcRenderer.invoke('convert-video', url, format, folderPath),
  selectDownloadFolder: () => ipcRenderer.invoke('select-download-folder')
});