import {loadBaseBookList} from "../lib/load_book_list.js";


export default function (req, resp) {
    let items = loadBaseBookList()
    resp.json(items);
}
