import writeJson from "../lib/write_json.js";
import loadBookInfo from "../lib/load_book_info.js";
import loadBookFetchScript from "../lib/load_book_fetch_script.js";

/**
 * 书籍详情
 *
 * @param {Connect.IncomingMessage} req
 * @param resp
 */
export default async function bookInfoHandler(req, resp) {
    let bookName = req.body.bookName;
    const bookInfo = await loadBookInfo(bookName)
    if (bookInfo === null) {
        writeJson(resp, {
            code: 4000,
            data: null,
            message: "book " + bookName + " not found"
        });
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
    writeJson(resp, {
        code: 0,
        data: {
            title,
            docURL,
            projectName,
            fetchScript
        },
        message: ""
    });
}
