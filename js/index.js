const { ipcRenderer } = require('electron');
const path = require('path');
const replace = require('../js/replace');
const downloadFile = require('../js/google');
const config = require('../js/config');
const admZip = require('../js/zip');
const check = require('../js/check');
const logger = require('../js/logger');

const file = path.join(config.getDownloadDir(), 'rus.zip');

const HTMLselectedPath = document.getElementById('selectedPath');
const HTMLstartBut = document.getElementById('startDL');
const HTMLstatusBlock = document.getElementById('statusBlock');

document.getElementById('selectFolder').addEventListener('click', async () => {
    const path = await ipcRenderer.invoke('select-folder');
    if (path) {
        HTMLselectedPath.textContent = path;
        document.getElementById("MainTab").click();
        updateProgress();
    }
    else {
        HTMLselectedPath.textContent = 'Выбрана некорректная папка!';
    }
});

document.getElementById('startDL').addEventListener('click', async () => {
    await ipcRenderer.invoke('start');
});

function changeTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

async function updateProgress() {
    const pathDir = config.readSavedPath();
    const downDir = config.getDownloadDir();

    if (pathDir) {
        const transUpd = await check.translationUpdateCheck();
        const folderUpd = await check.folderUpdateCheck();
        const updateNeeded = transUpd || folderUpd;

        if (updateNeeded) {
            logger('Качаем перевод');
            const zip = await downloadFile('1b06167m9_GtzUCCW2nyFrhiH-UUoR-wE', file);

            if (zip) {
                const targetFonts = path.join(config.readSavedPath(), config.getFontsPath());
                const targetLoc = path.join(config.readSavedPath(), config.getLocPath());
                const sourceFonts = path.join(config.getDownloadDir(), 'rus', 'fonts');
                const sourceLoc = path.join(config.getDownloadDir(), 'rus', 'localization');

                logger('Файл скачан, распакоука');
                await admZip(path.join(downDir, 'rus.zip'), path.join(downDir, 'rus'));

                logger('Заменяем файлы игры');
                await replace(sourceFonts, targetFonts);
                await replace(sourceLoc, targetLoc);
            } else {
                logger('Файл не скачан');
            }
        }

        HTMLstartBut.removeAttribute('disabled');
        logger('Готово');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.on('update-log', (event, { message }) => {
        HTMLstatusBlock.innerHTML += '- ' + message + '</br>';
    });

    const pathDir = config.readSavedPath();

    if (pathDir) {
        HTMLselectedPath.textContent = pathDir;
    } else {
        document.getElementById("SettingsTab").click();
    }

    updateProgress();
});