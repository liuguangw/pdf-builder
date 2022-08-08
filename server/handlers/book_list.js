import loadBaseBookList from "../lib/load_base_book_list.js";
import writeJson from "../lib/write_json.js";

/**
 *
 * @param {Connect.IncomingMessage} req
 * @param {ServerResponse} resp
 */
export default function bookListHandler(req, resp) {
    let items = loadBaseBookList()
    writeJson(resp, items)
}
