const asyncfs = require('fs').promises;
const { google } = require ('googleapis');

async function downloadFile(fileId, destPath) {
    const drive = google.drive({ 
        version: 'v3', 
        auth: 'AIzaSyAARi6Xp3wsT7dfHGtMd0CmkEBQxU0To7Q'
    });

    try {
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        });

        const file = await response.data.arrayBuffer();
        const buffer = Buffer.from(file);

        await asyncfs.writeFile(destPath, buffer);

        return true;
    } catch (err) {
        console.error('Ошибка: ', err);
        return false;
    }
}

module.exports = downloadFile