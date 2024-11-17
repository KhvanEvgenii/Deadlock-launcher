const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const config = require('../js/config');
const check = require('../js/check');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        autoHideMenuBar: true,
        // crtl+shift+i
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

ipcMain.handle('log-message', async (event, message, inLastDiv) => {
    mainWindow.webContents.send('update-log', {
        message,
        inLastDiv
    });
});

ipcMain.handle('version', async () => {
    return app.getVersion();
});

ipcMain.handle('quit', async () => {
    return app.quit();
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

ipcMain.handle('select-video', async (event, main) => {
    console.log(main);
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Movies', extensions: ['webm'] },
        ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const selectedVideo = result.filePaths[0];
        const correct = check.correntVideoFile(selectedVideo);
        console.log(selectedVideo);
        if (correct) {
            config.saveVideo(selectedVideo,main);
            return config.readSaveVideo(main);
        }
        return null;
    }
    return null;
});

ipcMain.handle('get-saved-path', () => {
    return config.readSavedPath();
});

ipcMain.handle('start', () => {
    exec("start steam://rungameid/1422450");
    return true;
});

