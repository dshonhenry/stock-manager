const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Invoke Methods
  savePDF: () => ipcRenderer.invoke('save-pdf'),
  updateStockFile: (args) => ipcRenderer.invoke('save-stock', args),
  exportData: () => ipcRenderer.invoke('export-data'),
  // Send Methods
  getId: (args) => ipcRenderer.sendSync('get-id', args),
  getStock: (args) => ipcRenderer.sendSync('get-stock', args),
  importData: () => ipcRenderer.sendSync('import-data'),

  
});