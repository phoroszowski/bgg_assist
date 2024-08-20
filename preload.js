const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchSuggestions: (query) => ipcRenderer.invoke('fetch-suggestions', query),
  fetchGameDetails: (query) => ipcRenderer.invoke('fetch-game-details', query),
  sendKeystrokes: (text) => ipcRenderer.send('send-keystrokes', text),
  closeWindow: () => ipcRenderer.send('close-window')
});
