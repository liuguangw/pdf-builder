import writeJson from "../lib/write_json.js";
import loadBookList from "../lib/load_book_list.js";

/**
 *
 * @param {Connect.IncomingMessage} req
 * @param {ServerResponse} resp
 */
export default function bookListHandler(req, resp) {
    let items = loadBookList()
    writeJson(resp, items)
}
