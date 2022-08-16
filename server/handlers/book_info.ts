import loadBookInfo from "../lib/load_book_info";
import loadBookFetchScript from "../lib/load_book_fetch_script";
import {IncomingMessage, ServerResponse} from "node:http";
import {readJson, writeErrorResponse, writeSuccessResponse} from "../lib/json_tools";
import {ApiRequest} from "../common/request";

/**
 * 书籍详情
 */
export default async function bookInfoHandler(req: IncomingMessage, resp: ServerResponse) {
    const reqBody: ApiRequest = await readJson(req);
    const bookName = reqBody.bookName;
    const bookInfo = await loadBookInfo(bookName)
    if (bookInfo === null) {
        writeErrorResponse(resp, "book " + bookName + " not found");
        return;
    }
    let serverURL = req.headers.origin
    if (serverURL === undefined) {
        serverURL = "http" + "://" + req.headers.host
    }
    const fetchScript = await loadBookFetchScript(bookInfo, serverURL)
    //只提取出需要的字段
    const {
        title,
        docURL,
        projectName
    } = bookInfo
    writeSuccessResponse(resp, {
        title,
        docURL,
        projectName,
        fetchScript
    });
}
