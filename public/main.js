const { app, BrowserWindow, ipcMain, dialog } = require('electron')

const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev');
const { isArray } = require('util');

const stockFile = path.join(isDev ? app.getAppPath() : app.getPath("userData"), '/stock.json');
const idFile = path.join(isDev ? app.getAppPath() : app.getPath("userData"), '/idIndex.json' ) ;
const mainFolder = isDev ? 'public' : 'build'

const savePDF = (filePath) => {
  let options = { format: 'A4' };
  
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), `./${mainFolder}/preload.js`)
    }
  })
  win.loadURL(`file://${path.join(__dirname, 'pdfTemplate.html')}`);
  win.webContents.on('did-finish-load', () => {
    win.webContents.printToPDF(options).then(data => {
      fs.writeFile(filePath, data, function (err) {
        console.log(err ? err : 'PDF Generated Successfully');     
        win.close();
      });
    }).catch(error => {
      console.log(error)
      win.close();
    });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(app.getAppPath(), `./${mainFolder}/preload.js`)
    }, 
    icon:path.join(__dirname, 'icon.ico')

  })

  win.loadURL(
    isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`
  )
  win.setMenu(null)
}
app.on('ready', createWindow)

ipcMain.handle('save-pdf', (event)=>{
  dialog.showSaveDialog({
    title: "Save file",
    defaultPath: path.resolve('/Documents/AMR Stock.pdf'),
    filters :[
      {name: 'PDF', extensions: ['pdf']}
    ],
  }).then(result => {
    if(!result.canceled)
      savePDF(result.filePath.toString(), stockFile)
  }).catch(err => {
    console.log(err)
  })
})

ipcMain.on('get-id', (event, args)=>{
  let idObj;
  try {
    idObj = JSON.parse(fs.readFileSync(idFile));
  }catch(e){
    idObj = {index:0}
    fs.writeFileSync(stockFile, JSON.stringify(idObj))
  }
  const output = idObj.index;
  idObj.index++;
  fs.writeFileSync(idFile, JSON.stringify(idObj))
  event.returnValue = output;
})

ipcMain.on('get-stock', (event, args)=>{
  let stock;
  try{
    let rawdata = fs.readFileSync(stockFile);
    stock = JSON.parse(rawdata)
  }
  catch(e){
    stock = {misc:[],snacks:[], powders:[]}
    fs.writeFileSync(stockFile, JSON.stringify(stock))
  }
  event.returnValue = stock;
})

ipcMain.on('import-data', (event)=>{
  dialog.showOpenDialog({
    title: "Import file",
    properties: ['openFile'],
    filters :[
      {name: 'JSON', extensions: ['json']}
    ],
  }).then(result => {
    if(!result.canceled){
      let stockBackup = fs.readFileSync(stockFile)
      let indexBackup = fs.readFileSync(idFile)
      try{
        let importData = JSON.parse(fs.readFileSync(result.filePaths[0].toString()))  
        console.log(importData)  
        if(!Array.isArray(importData.stock.misc)) throw new Error();
        if(!Array.isArray(importData.stock.snacks)) throw new Error();
        if(!Array.isArray(importData.stock.powders)) throw new Error();
        fs.writeFileSync(stockFile, JSON.stringify(importData.stock));
        fs.writeFileSync(idFile, JSON.stringify(importData.index));
        event.returnValue = 1;
      } catch(e) {
        fs.writeFileSync(stockFile, stockBackup);
        fs.writeFileSync(idFile, indexBackup);
        event.returnValue = 0;
      }
    }
  }).catch(err => {
    console.log(err)
  })
})

ipcMain.handle('export-data', ()=> {
  dialog.showSaveDialog({
    title: "Export file",
    defaultPath: path.resolve('/Documents/Stock Data.json'),
    filters :[
      {name: 'JSON', extensions: ['json']}
    ],
  }).then(result => {
    if(!result.canceled){
      let exportStock = JSON.parse(fs.readFileSync(stockFile))
      let exportIndex = JSON.parse(fs.readFileSync(idFile))
      let exportData = {stock:exportStock, index:exportIndex}
      fs.writeFileSync(result.filePath.toString(), JSON.stringify(exportData))
    }
  }).catch(err => {
    console.log(err)
  })
})

ipcMain.handle('save-stock', (event, stock)=> {
  fs.writeFileSync(stockFile, JSON.stringify(stock))
})