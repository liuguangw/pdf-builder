function convertMenuUrl(url) {
    let tmpUrl = url.substr("/pwa/".length);
    if (tmpUrl.endsWith("/")) {
        tmpUrl = tmpUrl.substr(0, tmpUrl.length - 1);
    }
    return tmpUrl.replace(/\//g, "-") + ".html";
}

function formatMenuList(menuList) {
    let resultHtml = "<ul>\n";
    menuList.forEach(menuItem => {
        let tmpHtml = "";
        let childMenuList = [];
        if (menuItem.hasOwnProperty("children")) {
            childMenuList = menuItem.children;
        }
        if (childMenuList.length === 0) {
            tmpHtml += "<li><a href=\"" + convertMenuUrl(menuItem.url) + "\">" + menuItem.name + "</a></li>";
        } else {
            tmpHtml += "<li><span>" + menuItem.name + "</span></li>";
            tmpHtml += formatMenuList(childMenuList);
        }
        resultHtml += tmpHtml;
    });
    resultHtml += "\n</ul>";
    return resultHtml;
}

function formatMenuHtml(bookTitle, menuInfo) {
    let allGroupHtml = "<div class=\"book-main-title\"><h1>" + bookTitle + "</h1></div>";
    allGroupHtml += "<div class='menu-list'>";
    allGroupHtml += formatMenuList(menuInfo);
    allGroupHtml += "</div>";
    return "<!DOCTYPE html>\n" +
        "<html lang=\"en\">\n" +
        "  <head>\n" +
        "    <meta charset=\"utf-8\" />\n" +
        "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n" +
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no\" />" +
        "    <title>" + bookTitle + "</title>\n" +
        "    <link rel=\"stylesheet\" href=\"../css/menu.css\" />\n" +
        "    <link rel=\"stylesheet\" href=\"../../laravel/css/menu-extra.css\"/>\n" +
        "  </head>\n" +
        "  <body>\n" + allGroupHtml + "\n" +
        "<div class=\"menu-tip\" style=\"margin-top: 0;\"><span>Generated by</span><a href=\"https://github.com/liuguangw/pdf-builder\">pdf-builder</a></div>\n" +
        " </body>\n" +
        "</html>";
}

module.exports = (bookInfo, menuInfo, menuHtmlCallback, errorFn) => {
    let htmlCode = formatMenuHtml(bookInfo.title, menuInfo);
    menuHtmlCallback(htmlCode);
};