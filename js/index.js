const { ipcRenderer } = require('electron');
const path = require('path');
const replace = require('../js/replace');
const downloadFile = require('../js/google');
const config = require('../js/config');
const admZip = require('../js/zip');
const check = require('../js/check');
const logger = require('../js/logger');
const updater = require('../js/updater');

const HTMLselectedPath = document.getElementById('selectedPath');
const HTMLstartBut = document.getElementById('startDL');
const HTMLstatusBlock = document.getElementById('statusBlock');
const HTMLvideoLoop = document.getElementById('videoPreviewLoop');
const HTMLvideoIntro = document.getElementById('videoPreviewIntro');

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

document.getElementById('selectLoopVideo').addEventListener('click', async () => {
    const path = await ipcRenderer.invoke('select-video',true);
    if (path) {
        HTMLvideoLoop.setAttribute('src', path);
    }
    else {
        // HTMLselectedPath.textContent = 'Выбрана некорректная папка!';
    }
});

document.getElementById('selectIntroVideo').addEventListener('click', async () => {
    const path = await ipcRenderer.invoke('select-video',false);
    if (path) {
        HTMLvideoIntro.setAttribute('src', path);
    }
    else {
        // HTMLselectedPath.textContent = 'Выбрана некорректная папка!';
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
    const videoIntro = config.readSaveVideo(false);
    const videoLoop = config.readSaveVideo(true);
    const downDir = config.getDownloadDir();

    if (videoIntro) {
        HTMLvideoIntro.setAttribute('src', videoIntro);
    }
    if (videoLoop) {
        HTMLvideoLoop.setAttribute('src', videoLoop);
    }
    
    try {
        if (pathDir) {
            const transUpd = await check.translationUpdateCheck();
            const folderUpd = await check.folderUpdateCheck();
            const videoIntro = config.readSaveVideo(false);
            const videoLoop = config.readSaveVideo(true);
    
            const videoUpd = videoIntro || videoLoop;
            const updateNeeded = transUpd || folderUpd;
            
            HTMLselectedPath.textContent = pathDir;

            if (updateNeeded) {
                logger('Качаем перевод');
                const file = path.join(downDir, 'rus.zip');
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
            // TO DO
            if (videoUpd){
                logger('Заменяем видео');
                const sourceVideos = config.videosDir;
                const targetVideos = path.join(config.readSavedPath(), config.videoDirTemplate);
    
                await replace(sourceVideos, targetVideos);
            }
    
            HTMLstartBut.removeAttribute('disabled');
            logger('Готово');
        }
        else {
            document.getElementById("SettingsTab").click();
        }
    } catch (error) {
        console.error('Ошибка сохранения конфига:', error);
    }

}

function beforeUpdateProgress() {
    const updateApp = updater.checkUpdate(updateProgress);
}


document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.on('update-log', (event, { message, inLastDiv }) => {
        if (inLastDiv) {
            const divs = document.querySelectorAll('#statusBlock div');
            const HTMLLastMassage = divs[divs.length - 1];

            HTMLLastMassage.innerHTML = '- ' + message + '</br>';
        } else {
            let elemDiv = document.createElement('div');
            HTMLstatusBlock.appendChild(elemDiv);
            elemDiv.innerHTML = '- ' + message + '</br>';
        }
    });

    beforeUpdateProgress();
});