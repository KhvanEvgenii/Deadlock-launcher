const path = require('path');
const fs = require('fs');
const configDir = path.join(__dirname, '..', 'userdata');
const downloadDir = path.join(__dirname, '..', 'downloads');
const configPath = path.join(configDir, 'config.json');
const fontDirTemplate = path.join('game', 'citadel', 'panorama', 'fonts');
const locDirTemplate = path.join('game', 'citadel', 'resource', 'localization');
const videoDirTemplate = path.join('game', 'citadel', 'panorama', 'videos', 'main_menu');
const videosDir = path.join(configDir, 'videos');
const videoLoopName = 'menu_streets_loop2.webm';
const videoIntroName = 'menu_streets_intro.webm';


function checkDir() {
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
    }
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({}));
    }
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }
    if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir);
    }
}

function readLog() {
    checkDir();
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config;
    } catch (error) {
        console.error('Ошибка чтения конфига:', error);
    }
    return null;
}

function readSavedTimeStamp() {
    checkDir();
    try {
        const config = readLog();
        if (config.updateTime) {
            return config.updateTime;
        }
    } catch (error) {
        console.error('Ошибка чтения конфига:', error);
    }
    return null;
}

function saveTimeStamp(newTime) {
    checkDir();
    try {
        const config = readLog();
        console.log('Сохраняем конфиг');

        if (config.updateTime) {
            config.updateTime = newTime;
        }
        else {
            config['updateTime'] = newTime;
        }
        fs.writeFileSync(configPath, JSON.stringify(config));
    } catch (error) {
        console.error('Ошибка сохранения конфига:', error);
    }
}

function getFontsPath() {
    return fontDirTemplate;
}

function getLocPath() {
    return locDirTemplate;
}
function readSavedPath() {
    checkDir();
    try {
        const config = readLog();
        if (config.selectedPath) {
            return config.selectedPath;
        }
    } catch (error) {
        console.error('Ошибка чтения конфига:', error);
    }
    return null;
}

function savePath(folderPath) {
    checkDir();
    try {
        const config = readLog();
        console.log('Сохраняем конфиг');

        if (config.selectedPath) {
            config.selectedPath = folderPath;
        }
        else {
            config['selectedPath'] = folderPath;
        }
        fs.writeFileSync(configPath, JSON.stringify(config));
    } catch (error) {
        console.error('Ошибка сохранения конфига:', error);
    }
}

function saveVideo(urlFile, main = true) {
    checkDir();

    let videoFile;
    let configName;
    try {
        const config = readLog();
        console.log('Сохраняем конфиг');
        if (main) {
            videoFile = path.join(videosDir, videoLoopName);
            configName = 'loopVideo';
        } else {
            videoFile = path.join(videosDir, videoIntroName);
            configName = 'introVideo';
        }
        const mainVideo = path.join(videosDir, videoLoopName);
        
        fs.copyFileSync(urlFile, videoFile);
 
        if (config[configName]) {
            config[configName] = videoFile;
        }
        else {
            config[configName] = videoFile;
        }
        fs.writeFileSync(configPath, JSON.stringify(config));
    } catch (error) {
        console.error('Ошибка сохранения конфига:', error);
    }
}

function readSaveVideo(main = true) {
    checkDir();

    let configName;

    if (main) {
        configName = 'loopVideo';
    } else {
        configName = 'introVideo';
    }

    try {
        const config = readLog();
        if (config[configName]) {
            return config[configName];
        }
    } catch (error) {
        console.error('Ошибка чтения конфига:', error);
    }
    return null;
}

function readFolderUpdateTime() {
    checkDir();
    try {
        const config = readLog();
        if (config.folderUpdateTime) {
            return new Date(config.folderUpdateTime);
        }
    } catch (error) {
        console.error('Ошибка чтения конфига:', error);
    }
    return null;
}

function saveFolderUpdateTime(NewTime) {
    checkDir();
    try {
        const config = readLog();
        console.log('Сохраняем конфиг');

        if (config.folderUpdateTime) {
            config.folderUpdateTime = NewTime;
        }
        else {
            config['folderUpdateTime'] = NewTime;
        }
        fs.writeFileSync(configPath, JSON.stringify(config));
    } catch (error) {
        console.error('Ошибка сохранения конфига:', error);
    }
}

function getDownloadDir() {
    checkDir();
    return downloadDir;
}

module.exports = {
    readSavedTimeStamp,
    saveTimeStamp,
    readSavedPath,
    savePath,
    readSaveVideo,
    saveVideo,
    readFolderUpdateTime,
    saveFolderUpdateTime,
    getDownloadDir,
    getFontsPath,
    getLocPath,
    videosDir,
    videoDirTemplate,
};