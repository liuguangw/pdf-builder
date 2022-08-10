import {loadBaseBookInfo} from "../lib/load_book_info.js";
import {projectDistDir} from "../lib/path_helper.js";
import {writeFile} from "fs/promises";
import writeJson from "../lib/write_json.js";

/**
 *
 * @param {string} htmlPath
 * @param {string} title
 * @param {string} content
 * @param {string[]} styles
 * @return {Promise<void>}
 */
async function saveBookContent(htmlPath, title, content, styles) {
    let contentHtml = formatContentHtml(title, content, styles);
    await writeFile(htmlPath, contentHtml);
}

/**
 *
 * @param {string} title
 * @param {string} content
 * @param {string[]} styles
 * @return {string}
 */
function formatContentHtml(title, content, styles) {
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
        resp.end("{}");
        let filename = req.body.filename;
        //抓取网页失败
        if (req.body.status !== 0) {
            io.emit("fetch-content-error", bookName, req.body.progress, filename, req.body.title, req.body.message);
            return;
        }
        let htmlPath = projectDistDir(bookName) + "/" + filename;
        try {
            await saveBookContent(htmlPath, req.body.title, req.body.content, bookInfo.styles);
            io.emit("save-content-success", bookName, req.body.progress, filename, req.body.title);
        } catch (e) {
            io.emit("save-content-error", bookName, req.body.progress, filename, req.body.title, e.message);
        }
    }
}
