import {bookList} from "./book_list.js";

/**
 * 书籍详情
 *
 * @param {IncomingMessage} req
 * @param resp
 */
export default async function (req, resp) {
    let items =await bookList();
    let bookName = req.params.bookName;
    let bookInfo = null;
    items.forEach(itemInfo => {
        if (itemInfo.projectName === bookName) {
            bookInfo = itemInfo
        }
    });
    if (bookInfo !== null) {
        resp.json({
            code: 0,
            data: bookInfo,
            message: ""
        });
        return;
    }
    resp.json({
        code: 4000,
        data: null,
        message: "book " + bookName + " not found"
    });
}
