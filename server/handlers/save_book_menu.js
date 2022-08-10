import {writeFile, stat, mkdir} from 'fs/promises';
import formatMenuList from "../lib/format_menu_list.js";
import {loadBaseBookInfo} from "../lib/load_book_info.js";
import {projectDistDir} from "../lib/path_helper.js";
import writeJson from "../lib/write_json.js";

function formatMenuHtml(projectName, bookTitle, menuList) {
    let menuListHtml = formatMenuList(menuList, 1)
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>目录 - ${bookTitle}</title>
    <link rel="stylesheet" href="../../../css/menu.css" />
    </head>
    <body>
        <div class="book-main-title">
            <h1 class="pdf-toc1">目录</h1>
        </div>
        <div class="menu-list">${menuListHtml}
        </div>
        <div class="menu-tip"><span>Generated by</span><a href="https://github.com/liuguangw/pdf-builder">pdf-builder</a></div>
    </body>
</html>`;
}

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

/**
 * 保存menu信息
 */
export default function saveBookMenuHandler(io) {
    return async function (req, resp) {
        let bookName = req.body.bookName;
        let bookInfo = loadBaseBookInfo(bookName)
        if (bookInfo === null) {
            writeJson(resp, {
                code: 4000,
                data: null,
                message: "book " + bookName + " not found"
            });
            return;
        }
        try {
            await saveBookMenu(bookInfo, req.body.menuList);
            io.emit("save-menu-success", bookName)
        } catch (e) {
            writeJson(resp, {
                code: 4000,
                data: null,
                message: e.message
            });
            return;
        }
        writeJson(resp, {
            code: 0,
            data: null,
            message: ""
        });
    }
}
