const fse = require('fs-extra');
const path = require('path');
const bookInfo = require('./config')();
const bookEntryFile = bookInfo.entryFile;
const bookTitle = bookInfo.title;

function formatMenuHtml(menuInfo) {
    let allGroupHtml = "<div class=\"book-main-title\"><h1>" + bookTitle + "</h1></div>";
    for (let menuGroupIndex = 0; menuGroupIndex < menuInfo.length; menuGroupIndex++) {
        let groupHtml = "<div class=\"menu-group\">";
        let groupInfo = menuInfo[menuGroupIndex];
        groupHtml += "<div class=\"menu-group-title\">" + groupInfo.title + "</div>";
        groupHtml += "<ul>";
        for (let i = 0; i < groupInfo.list.length; i++) {
            let pageNode = groupInfo.list[i];
            groupHtml += "<li><a href=\"" + pageNode.url + "\">" + pageNode.title + "</a></li>";
        }
        groupHtml += "</ul></div>";
        allGroupHtml += groupHtml;
    }
    return "<!DOCTYPE html>\n" +
        "<html lang=\"en\">\n" +
        "  <head>\n" +
        "    <meta charset=\"utf-8\" />\n" +
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