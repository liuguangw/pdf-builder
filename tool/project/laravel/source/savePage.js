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
        "    <link rel=\"stylesheet\" href=\"css/style.css\" />" +
        "  </head>\n" +
        "  <body>\n" +
        "  <div class=\"ui segment article-content\">\n" +
        "    <div class=\"extra-padding\">\n" +
        content + "\n" +
        "    </div>\n" +
        "  </div>" +
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
            let fPath = url.substr(0, url.indexOf("/")) + ".html";
            fse.writeFile(path.resolve(saveDir, fPath), htmlCode, 'utf8', (writeErr) => {
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