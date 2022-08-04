import loadBookList from "./load_book_list.js";

/**
 *
 * @param {string} bookName
 * @return {Promise<Object|null>}
 */
export default async function loadBookInfo(bookName) {
    let items = await loadBookList();
    let bookInfo = null;
    for (let itemIndex in items) {
        let itemInfo = items[itemIndex];
        if (itemInfo.projectName === bookName) {
            bookInfo = itemInfo;
            break;
        }
    }
    return bookInfo;
}
