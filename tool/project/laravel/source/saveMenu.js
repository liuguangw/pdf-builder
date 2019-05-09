const fse = require('fs-extra');
const path = require('path');
const bookInfo = require('./config')();
const bookEntryFile = bookInfo.entryFile;
const bookTitle = bookInfo.title;

function formatMenuHtml(menuInfo) {
    let allGroupHtml = "<h1 class=\"toc-h1\">" + bookTitle + "</h1>\n" +
        "\t<div class=\"toc-main\">\n" +
        "\t<ul>\n";
    for (let menuGroupIndex = 0; menuGroupIndex < menuInfo.length; menuGroupIndex++) {
        let groupHtml = "\t\t<li class=\"toc-group toc-item\">\n";
        let groupInfo = menuInfo[menuGroupIndex];
        groupHtml += "\t\t\t<span class=\"toc-title\">" + groupInfo.title + "</span>\n";
        groupHtml += "\t\t\t<ol>\n";
        for (let i = 0; i < groupInfo.list.length; i++) {
            let pageNode = groupInfo.list[i];
            let pageUrl = pageNode.url;
            pageUrl = pageUrl.substr(0, pageUrl.indexOf('/')) + ".html";
            groupHtml += "\t\t\t\t<li class=\"toc-item\"><a href=\"" + pageUrl + "\">" + pageNode.title + "</a></li>\n";
        }
        groupHtml += "\t\t\t</ol>\n" +
            "\t\t</li>\n";
        allGroupHtml += groupHtml;
    }
    allGroupHtml += "\t</ul>\n\t</div>";
    return "<!DOCTYPE html>\n" +
        "<html lang=\"en\">\n" +
        "  <head>\n" +
        "    <meta charset=\"utf-8\" />\n" +
        "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n" +
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no\" />" +
        "    <title>" + bookTitle + "</title>\n" +
        "    <link rel=\"stylesheet\" href=\"css/style.css\" />" +
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