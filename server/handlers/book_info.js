import writeJson from "../lib/write_json.js";
import loadBookInfo, {addFetchScript} from "../lib/load_book_info.js";

/**
 * 书籍详情
 *
 * @param {Connect.IncomingMessage} req
 * @param resp
 */
export default async function bookInfoHandler(req, resp) {
    let bookName = req.body.bookName;
    let bookInfo = loadBookInfo(bookName)
    let serverURL = req.headers.origin
    if (serverURL === undefined) {
        serverURL = "http" + "://" + req.headers.host
    }
    await addFetchScript(bookInfo, serverURL);
    if (bookInfo === null) {
        writeJson(resp, {
            code: 4000,
            data: null,
            message: "book " + bookName + " not found"
        });
        return;
    }
    writeJson(resp, {
        code: 0,
        data: bookInfo,
        message: ""
    });
}
