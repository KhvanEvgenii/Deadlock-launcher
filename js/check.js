const fs = require('fs');
const asyncfs = require('fs').promises;
const jsdom = require("jsdom");
const config = require('../js/config');
const path = require('path');
const logger = require('../js/logger');

const baseLink = 'https://forums.playdeadlock.com/resources/ЗАМЕНА-НАЗВАНИЙ-ГЕРОЕВ-ПРЕДМЕТОВ-И-УМЕНИЙ-С-РУССКОГО-НА-АНГЛИЙСКИЙ.6/updates';

function correctFolder(selectedFolder){
    const fonts = path.join(selectedFolder,config.getFontsPath());
    const loc = path.join(selectedFolder,config.getLocPath());

    let result = true;

    if (!fs.existsSync(fonts)) {
        result = false;
    }

    if (!fs.existsSync(loc)) {
        result = false;
    }

    return result;
}

async function getData() {
    const { JSDOM } = jsdom;
    try {
        const response = await fetch(baseLink);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const dom = new JSDOM(html);
        const mypara = dom.window.document.getElementsByClassName("u-dt")[0];
        return mypara.getAttribute('data-timestamp');
    } catch (error) {
        logger('Ошибка при получении данных');
        throw error;
    }
}

async function folderUpdateCheck() {
    logger('Проверяем папку');
    const fuptime = config.readFolderUpdateTime();
    const folderPath = config.readSavedPath();
    
    try {
        const stats = await asyncfs.stat(folderPath);
        const newfupTime = stats.mtime;
        const unixnewfupTime = newfupTime.getTime();
        const unixfuptime = fuptime ? fuptime.getTime() : false;

        if (unixnewfupTime !== unixfuptime) {
            config.saveFolderUpdateTime(newfupTime);
            logger('Папка была изменена');
            return true;
        } else {
            logger('Папка не изменялась');
            return false;
        }
    } catch (error) {
        logger('Ошибка при проверке папки');
        return false;
    }
}

async function translationUpdateCheck() {
    logger('Проверяем перевод');

    try {
        const newTime = await getData();
        const updateTime = await config.readSavedTimeStamp();

        if (newTime != updateTime) {
            config.saveTimeStamp(newTime);
            logger('Требуется обновление перевода');
            return true;
        }

        logger('Не требуется обновление перевода');
        return false;
    } catch (error) {
        logger('Ошибка при проверке обновлений перевода');
        throw error;
    }
}

module.exports = {
    translationUpdateCheck,
    folderUpdateCheck,
    correctFolder,
    getData,
};