import {loadBaseBookInfo} from "../lib/load_book_info.js";
import {projectDistDir} from "../lib/path_helper.js";
import {writeFile} from "fs/promises";
import writeJson from "../lib/write_json.js";

/**
 * 根据参数,生成html内容
 *
 * @param {string} title 标题
 * @param {string[]} styles 样式文件列表
 * @param {string} content 内容html
 * @return {string} 返回完整的html代码
 */
function formatContentHtml(title, styles, content) {
    let styleHtml = "";
    styles.forEach(stylePath => {
        styleHtml += `\n\t\t<link rel="stylesheet" href="../${stylePath}" />`
    })
    return `<!DOCTYPE html>
<html lang="zh-CN">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>${title}</title>
        <link rel="stylesheet" href="../../../css/content.css" />${styleHtml}
    </head>
    <body>
        <div class="main-book-content">${content}</div>
    </body>
</html>`
}

/**
 * 根据参数,保存网页到本地文件
 *
 * @param {string} htmlPath 保存路径
 * @param {string} title 标题
 * @param {string[]} styles 样式文件列表
 * @param {string} content 内容html
 * @return {Promise<void>}
 */
async function saveBookContent(htmlPath, title, styles, content) {
    let contentHtml = formatContentHtml(title, styles, content);
    await writeFile(htmlPath, contentHtml);
}

/**
 * 保存网页内容
 */
export default function saveBookContentHandler(io) {
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
        let filename = req.body.filename;
        //抓取网页失败
        if (req.body.status !== 0) {
            io.emit("fetch-content-error", bookName, req.body.progress, filename, req.body.title, req.body.message);
            writeJson(resp, {
                code: 4000,
                data: null,
                message: req.body.message
            });
            return;
        }
        let htmlPath = projectDistDir(bookName) + "/" + filename;
        try {
            await saveBookContent(htmlPath, req.body.title, bookInfo.styles, req.body.content);
        } catch (e) {
            io.emit("save-content-error", bookName, req.body.progress, filename, req.body.title, e.message);
            writeJson(resp, {
                code: 4000,
                data: null,
                message: e.message
            });
            return
        }
        io.emit("save-content-success", bookName, req.body.progress, filename, req.body.title);
        writeJson(resp, {
            code: 0,
            data: null,
            message: ""
        });
    }
}
