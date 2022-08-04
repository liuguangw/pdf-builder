import loadBookList from "../lib/load_book_list.js";


export default async function (req, resp) {
    let items =await loadBookList();
    resp.json(items);
}
