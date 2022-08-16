import loadBookInfo from "../lib/load_book_info";
import {projectDistDir} from "../lib/path_helper";
import {writeFile} from "fs/promises";
import {Server as SocketIoServer} from "socket.io";
import {Connect} from "vite";
import {IncomingMessage, ServerResponse} from "node:http";
import {ContentApiRequest, FetchStatus} from "../common/request";
import {readJson, writeErrorResponse, writeSuccessResponse} from "../lib/json_tools";

/**
 * 根据参数,生成html内容
 * @param title
 * @param styles
 * @param content
 */
function formatContentHtml(title: string, styles: string[], content: string) {
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
 * @param htmlPath
 * @param title
 * @param styles
 * @param content
 */
async function saveBookContent(htmlPath: string, title: string, styles: string[], content: string) {
    let contentHtml = formatContentHtml(title, styles, content);
    await writeFile(htmlPath, contentHtml);
}

/**
 * 保存网页内容
 */
export default function saveBookContentHandler(io: SocketIoServer): Connect.SimpleHandleFunction {
    return async function (req: IncomingMessage, resp: ServerResponse) {
        let reqBody: ContentApiRequest = await readJson(req);
        let bookName = reqBody.bookName;
        let bookInfo = await loadBookInfo(bookName)
        if (bookInfo === null) {
            writeErrorResponse(resp, "book " + bookName + " not found");
            return;
        }
        let filename = reqBody.filename;
        //抓取网页失败
        if (reqBody.status !== FetchStatus.Ok) {
            io.emit("fetch-content-error", bookName, reqBody.progress, filename, reqBody.title, reqBody.message);
            writeErrorResponse(resp, reqBody.message);
            return;
        }
        let htmlPath = projectDistDir(bookName) + "/" + filename;
        try {
            await saveBookContent(htmlPath, reqBody.title, bookInfo.styles, reqBody.content);
        } catch (e) {
            io.emit("save-content-error", bookName, reqBody.progress, filename, reqBody.title, e.message);
            writeErrorResponse(resp, e.message);
            return
        }
        io.emit("save-content-success", bookName, reqBody.progress, filename, reqBody.title);
        writeSuccessResponse(resp)
    }
}
