//*************************************************************** */
//
//  Program Title: Commodity Price Tool
//  Created on: 5/7/20
//
//  Collaborators: Jacob Helminski, Ross Klonwski, Jacob Schandel
//
//  The program displays commodity prices based upon user entered data.
//  Prices are stored in a AWS DynamoDB NoSQL database.
//
//*************************************************************** */

// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')

function createWindow () {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        resizable: false,
        title: "Commodity Price Tool",
        frame: false, //true will enable file,view and top menubar
        webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})