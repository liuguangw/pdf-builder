import loadBookInfo from "../lib/load_book_info.js";

/**
 * 处理can build通知
 */
export default function notifyCanBuildHandler(io) {
    return async function (req, resp) {
        let bookName = req.params.bookName;
        let bookInfo = await loadBookInfo(bookName)
        if (bookInfo === null) {
            resp.json({
                code: 4000,
                data: null,
                message: "book " + bookName + " not found"
            });
            return;
        }
        try {
            io.emit("can-build", bookName)
        } catch (e) {
            resp.json({
                code: 4000,
                data: null,
                message: e.message
            });
            return;
        }
        resp.json({
            code: 0,
            data: null,
            message: ""
        });
    }
}
