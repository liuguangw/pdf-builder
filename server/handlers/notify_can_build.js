import {loadBaseBookInfo} from "../lib/load_book_info.js";
import writeJson from "../lib/write_json.js";

/**
 * 处理can build通知
 */
export default function notifyCanBuildHandler(io) {
    return function (req, resp) {
        let bookName = req.body.bookName;
        let bookInfo = loadBaseBookInfo(bookName)
        if (bookInfo === null) {
           writeJson(resp,{
                code: 4000,
                data: null,
                message: "book " + bookName + " not found"
            });
            return;
        }
        try {
            io.emit("can-build", bookName)
        } catch (e) {
           writeJson(resp,{
                code: 4000,
                data: null,
                message: e.message
            });
            return;
        }
       writeJson(resp,{
            code: 0,
            data: null,
            message: ""
        });
    }
}
