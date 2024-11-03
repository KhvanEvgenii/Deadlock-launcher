const admzip = require('adm-zip');

function unZip(pathZip, targetPath) {
    const zip = new admzip(pathZip);
    zip.extractAllTo(targetPath, true);
}

module.exports = unZip