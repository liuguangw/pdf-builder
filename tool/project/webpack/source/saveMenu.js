const fse = require('fs-extra');
const path = require('path');
const bookInfo = require('./config')();
const bookEntryFile = bookInfo.entryFile;
const bookTitle = bookInfo.title;

function formatMenuHtml(menuInfo) {
    let allGroupHtml = "<h1 class=\"toc-h1\">" + bookTitle + "</h1>\n" +
        "\t<div class=\"toc-main\">\n" +
        "\t<ul>\n" +
        "\t\t<li class=\"toc-group toc-item\">\n" +
        "\t\t\t<ol>\n";
    for (let menuGroupIndex = 0; menuGroupIndex < menuInfo.length; menuGroupIndex++) {
        let pageNode = menuInfo[menuGroupIndex];
        let pageUrl = pageNode.url;
        if (pageUrl === "") {
            pageUrl = "index.html";
        } else {
            pageUrl = pageUrl.substr(0, pageUrl.indexOf("/")) + ".html";
        }
        allGroupHtml += "\t\t\t\t<li class=\"toc-item\"><a href=\"" + pageUrl + "\">" + pageNode.title + "</a></li>\n";
    }
    allGroupHtml += "\t\t\t</ol>\n" +
        "\t\t</li>\n";
    allGroupHtml += "\t</ul>\n\t</div>";
    return "<!DOCTYPE html>\n" +
        "<html lang=\"en\">\n" +
        "  <head>\n" +
        "    <meta charset=\"utf-8\" />\n" +
        "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n" +
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no\" />" +
        "    <title>" + bookTitle + "</title>\n" +
        "    <link rel=\"stylesheet\" href=\"css/menu.css\" />" +
        "  </head>\n" +
        "  <body>\n" + allGroupHtml + "\n" +
        " </body>\n" +
        "</html>";
}

function writeMenuInfo(menuFilePath, menuInfo, successFn, errorFn) {
    let htmlCode = formatMenuHtml(menuInfo);
    fse.writeFile(menuFilePath, htmlCode, 'utf8', (writeErr) => {
        if (writeErr) {
            errorFn(writeErr.message);
        } else {
            successFn();
        }
    });
}

function saveMenu(menuInfo, successFn, errorFn) {
    let saveDir = path.dirname(bookEntryFile);
    fse.ensureDir(saveDir, err => {
        if (err) {
            errorFn(err.message);
        } else {
            //复制css
            fse.copy(path.resolve(__dirname, "../css"), path.resolve(saveDir, "css"), (copyErr) => {

                if (copyErr) {
                    errorFn(copyErr.message);
                } else {
                    writeMenuInfo(bookEntryFile, menuInfo, successFn, errorFn);
                }

            });
        }
    });
}

module.exports = saveMenu;