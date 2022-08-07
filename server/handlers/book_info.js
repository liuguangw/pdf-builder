import {loadBaseBookInfo} from "../lib/load_book_info.js";
import {addFetchScript} from "../lib/load_book_list.js";

/**
 * 书籍详情
 *
 * @param {IncomingMessage} req
 * @param resp
 */
export default async function (req, resp) {
    let bookName = req.params.bookName;
    let bookInfo = loadBaseBookInfo(bookName)
    await addFetchScript(bookInfo)
    if (bookInfo === null) {
        resp.json({
            code: 4000,
            data: null,
            message: "book " + bookName + " not found"
        });
        return;
    }
    resp.json({
        code: 0,
        data: bookInfo,
        message: ""
    });
}
