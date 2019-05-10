const fse = require('fs-extra');
const path = require('path');
const bookConfig = require("./config");
const bookInfo = bookConfig();
const bookEntryFile = bookInfo.entryFile;

function formatPageHtml(title, content) {
    return "<!DOCTYPE html>\n" +
        "<html lang=\"en\">\n" +
        "  <head>\n" +
        "    <meta charset=\"utf-8\" />\n" +
        "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n" +
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no\" />" +
        "    <title>" + title + "</title>\n" +
        "    <link rel=\"stylesheet\" href=\"css/prettyprint.css\" />" +
        "    <link rel=\"stylesheet\" href=\"css/main.css\" />" +
        "  </head>\n" +
        "  <body>\n" + content + "\n" +
        " </body>\n" +
        "</html>";
}

function savePage(url, title, content, successFn, errorFn) {
    let saveDir = path.dirname(bookEntryFile);
    fse.ensureDir(saveDir, err => {
        if (err) {
            errorFn(err.message);
        } else {
            let htmlCode = formatPageHtml(title, content);
            let fName = url;
            if (fName.endsWith("/")) {
                fName = fName.substr(0, fName.length - 1);
            }
            fName = fName.replace("/", "-") + ".html";
            fse.writeFile(path.resolve(saveDir, fName), htmlCode, 'utf8', (writeErr) => {
                if (writeErr) {
                    errorFn(writeErr.message);
                } else {
                    successFn();
                }
            });
        }
    });
}

module.exports = savePage;