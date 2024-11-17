const fs = require('fs');
const { Downloader } = require("nodejs-file-downloader");
const config = require('../js/config');
const { ipcRenderer } = require('electron');
const logger = require('../js/logger');
const exec = require('child_process').exec;

async function Download(fileUrl) {
  logger('Качаем обновление');
  logger('Прогресс обновления');
  const downloader = new Downloader({
    url: fileUrl,
    directory: config.getDownloadDir(),
    cloneFiles: false,
    onProgress: function (percentage) {
      logger("% "+percentage,true);
    },
  });
  try {
    const { filePath } = await downloader.download();
    // const filePath = path.join(config.getDownloadDir(),'deadlocklauncher Setup 0.0.3.exe');
    const updaterBatPath = createUpdaterBat(filePath);

    exec(`start "" "${updaterBatPath}"`, (error) => {
      if (error) {
        logger('Ошибка при запуске updater.bat');
        console.error("Failed to execute updater.bat", error);
      } else {
        logger('Обновление запущено');
      }
    });

    logger('Обновление скачено, запустите новый файл');
  } catch (error) {
    logger('Ошибка при загрузке обновления');
    console.log("Download failed", error);
    if (error.responseBody) {
      console.log(error.responseBody)
    }
  }
}

function createUpdaterBat(installerPath) {
  const batContent = `
@echo off
echo Closing the application...
taskkill /f /im deadlocklauncher.exe
echo Starting installer...
start "" "${installerPath}"
exit
  `;

  const batFilePath = path.join(config.getDownloadDir(), 'updater.bat');

  fs.writeFileSync(batFilePath, batContent, 'utf8');
  return batFilePath;
}

function verison(message) {
  return ipcRenderer.invoke('version');
}

async function checkUpdate(afterCheking) {
  // afterCheking();
  // return null;
  logger('Проверяем обновление');
  const request = require('request');
  const currentVersion = await verison();
  
  const options = {
    url: 'https://api.github.com/repos/KhvanEvgenii/Deadlock-launcher/releases',
    timeout: 10000,
    headers: {
      'User-Agent': 'request'
    }
  };
  
  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      const info = JSON.parse(body);
      const assets = info[0].assets;
      const tag = info[0].tag_name;
      const newVersion = tag.replace('v',''); 
      const { compareversion } = require('../js/updater');
    
      if (compareversion(currentVersion,newVersion)){
        logger('Доступно обновление');
        const fileUri = assets[0].browser_download_url;
        const locDownloader = require('../js/updater');
        locDownloader.Download(fileUri);
      }
      else{
        afterCheking();
      }
    }
    else {
      logger('Не удалось проверить обновление');
      afterCheking();
    }
  }
  
  request(options, callback);
}

function compareversion(version1,version2){

  var result=false;

  if(typeof version1!=='object'){ version1=version1.toString().split('.'); }
  if(typeof version2!=='object'){ version2=version2.toString().split('.'); }

  for(var i=0;i<(Math.max(version1.length,version2.length));i++){

      if(version1[i]==undefined){ version1[i]=0; }
      if(version2[i]==undefined){ version2[i]=0; }

      if(Number(version1[i])<Number(version2[i])){
          result=true;
          break;
      }
      if(version1[i]!=version2[i]){
          break;
      }
  }
  return(result);
}

module.exports = {
  Download,
  checkUpdate,
  compareversion,
};

