const path = require('path');
const fs = require('fs');
const configDir = path.join(__dirname, '..', 'userdata');
const downloadDir = path.join(__dirname, '..', 'downloads');
const configPath = path.join(configDir, 'config.json');
const fontDirTemplate = path.join('game', 'citadel', 'panorama','fonts');
const locDirTemplate = path.join('game', 'citadel', 'resource','localization');

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
    readFolderUpdateTime,
    saveFolderUpdateTime,
    getDownloadDir,
    getFontsPath,
    getLocPath,
};