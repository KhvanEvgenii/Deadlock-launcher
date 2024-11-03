const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const config = require('../js/config');
const check = require('../js/check');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        //autoHideMenuBar: false,
        icon: '../static/icon.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('html/index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('log-message', async (event, message) => {
    mainWindow.webContents.send('update-log', {
        message
    });
});

ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        const correct = check.correctFolder(selectedPath);

        if (correct) {        
            config.savePath(selectedPath);
            return selectedPath;
        }
        return null;
    }
    return null;
});

ipcMain.handle('get-saved-path', () => {
    return config.readSavedPath();
});

ipcMain.handle('start', () => {
    const { exec } = require('node:child_process');
    const exeDir = path.join(config.readSavedPath(),'game','bin','win64','project8.exe');
    exec(exeDir);
    return true;
});