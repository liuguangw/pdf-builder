import {writeFile, stat, mkdir} from 'fs/promises';
import formatMenuList from "../lib/format_menu_list.js";
import loadBookInfo from "../lib/load_book_info.js";
import {projectDistDir} from "../lib/path_helper.js";

async function saveBookMenu(bookInfo, menuList) {
    let projectName = bookInfo.projectName;
    let menuHtml = formatMenuHtml(projectName, bookInfo.title, menuList)
    //如果dist目录不存在,自动创建
    let saveDir = projectDistDir(projectName)
    try {
        await stat(saveDir)
    } catch (e) {
        await mkdir(saveDir)
    }
    let savePath = saveDir + "/__entry.html"
    await writeFile(savePath, menuHtml)
}

function formatMenuHtml(projectName, bookTitle, menuList) {
    let allGroupHtml = "\t<div class=\"book-main-title\"><h1>目录</h1></div>\n" +
        "\t<div class=\"menu-list\">\n";
    allGroupHtml += formatMenuList(menuList, 1)
    allGroupHtml += "\n\t</div>\n"
    return "<!DOCTYPE html>\n" +
        "<html lang=\"zh-CN\">\n" +
        "  <head>\n" +
        "    <meta charset=\"utf-8\" />\n" +
        "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n" +
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no\" />\n" +
        "    <title>目录 - " + bookTitle + "</title>\n" +
        "    <link rel=\"stylesheet\" href=\"../../../css/menu.css\" />\n" +
        "  </head>\n" +
        "  <body>\n" + allGroupHtml +
        "   <div class=\"menu-tip\"><span>Generated by</span><a href=\"https://github.com/liuguangw/pdf-builder\">pdf-builder</a></div>\n" +
        " </body>\n" +
        "</html>";
}

/**
 * 保存menu信息
 */
export default function saveBookMenuHandler(io) {
    return async function (req, resp) {
        let bookName = req.params.bookName;
        let bookInfo = await loadBookInfo(bookName)
        if (bookInfo === null) {
            resp.json({
                code: 4000,
                data: null,
                message: "book " + bookName + " not found"
            });
            return;
        }
        try {
            await saveBookMenu(bookInfo, req.body);
            io.emit("save-menu-success", bookName)
        } catch (e) {
            resp.json({
                code: 4000,
                data: null,
                message: e.message
            });
            return;
        }
        resp.json({
            code: 0,
            data: null,
            message: ""
        });
    }
}
