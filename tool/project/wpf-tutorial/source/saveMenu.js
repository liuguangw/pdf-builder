const fse = require('fs-extra');
const path = require('path');
const bookInfo = require('./config')();
const bookEntryFile = bookInfo.entryFile;
const bookTitle = bookInfo.title;

function formatMenuHtml(menuInfo) {
    let allGroupHtml = "<div class=\"book-main-title\"><h1>" + bookTitle + "</h1></div>";
    for (let menuGroupIndex = 1; menuGroupIndex < menuInfo.length; menuGroupIndex++) {
        let groupHtml = "<div class=\"menu-group\">";
        let groupInfo = menuInfo[menuGroupIndex];
        groupHtml += "<div class=\"menu-group-title\">" + groupInfo.title + "</div>";
        groupHtml += "<ul>";
        for (let i = 0; i < groupInfo.list.length; i++) {
            let pageNode = groupInfo.list[i];
            let pageUrl = pageNode.url;
            if (pageUrl.endsWith("/")) {
                pageUrl = pageUrl.substr(0, pageUrl.length - 1);
            }
            pageUrl = pageUrl.replace("/", "-") + ".html";
            groupHtml += "<li><a href=\"" + pageUrl + "\">" + pageNode.title + "</a></li>";
        }
        groupHtml += "</ul></div>";
        allGroupHtml += groupHtml;
    }
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