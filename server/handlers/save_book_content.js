import {loadBaseBookInfo} from "../lib/load_book_info.js";
import {projectDistDir} from "../lib/path_helper.js";
import {writeFile} from "fs/promises";

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
    for (let i = 0; i < styles.length; i++) {
        styleHtml += ("    <link rel=\"stylesheet\" href=\"../" + styles[i] + "\" />\n");
    }
    return "<!DOCTYPE html>\n" +
        "<html lang=\"zh-CN\">\n" +
        "  <head>\n" +
        "    <meta charset=\"utf-8\" />\n" +
        "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n" +
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no\" />\n" +
        "    <title>" + title + "</title>\n" + styleHtml +
        "  </head>\n" +
        "  <body>\n" +
        "   <div class=\"main-book-content\">" + content + "</div>\n" +
        " </body>\n" +
        "</html>";
}

/**
 * 保存网页内容
 */
export default function saveBookContentHandler(io) {
    return async function (req, resp) {
        let bookName = req.params.bookName;
        let bookInfo = loadBaseBookInfo(bookName)
        if (bookInfo === null) {
            resp.json({
                code: 4000,
                data: null,
                message: "book " + bookName + " not found"
            });
            return;
        }
        resp.send("{}");
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
