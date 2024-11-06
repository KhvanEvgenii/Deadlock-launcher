const { ipcRenderer } = require('electron');

function log(message, inLastDiv = false) {
    ipcRenderer.invoke('log-message', message, inLastDiv);
}

module.exports = log;