import loadBookList from "./load_book_list.js";
import loadBaseBookList from "./load_base_book_list.js";

/**
 *
 * @param {string} bookName
 * @return {Object|null}
 */
export function loadBaseBookInfo(bookName) {
    let items = loadBaseBookList()
    let bookInfo = items.find(itemInfo => itemInfo.projectName === bookName)
    return bookInfo === undefined ? null : bookInfo
}


/**
 *
 * @param {string} bookName
 * @return {Promise<Object|null>}
 */
export default async function loadBookInfo(bookName) {
    let items = await loadBookList();
    let bookInfo = items.find(itemInfo => itemInfo.projectName === bookName)
    return bookInfo === undefined ? null : bookInfo
}
