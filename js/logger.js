const { ipcRenderer } = require('electron');

function log(message) {
    ipcRenderer.invoke('log-message', message);
}

module.exports = log;