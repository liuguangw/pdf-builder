import kratos from "../projects/kratos/main.js";
import rustbook from "../projects/rustbook/main.js"
import {readFile} from "fs/promises"

export async function bookList() {
    let bookList = [];
    bookList.push(kratos(), rustbook());
    for(let bookIndex in bookList){
        bookList[bookIndex]=await addFetchScript(bookList[bookIndex]);
    }
    return bookList;
}

async function addFetchScript(bookInfo) {
    let fetchJsPath = "./server/projects/" + bookInfo.projectName + "/fetch.js";
    try{
        bookInfo.fetchScript = await readFile(fetchJsPath, {
            encoding: "utf-8"
        })
    }catch (e) {
        bookInfo.fetchScript = ""
        console.error(e)
    }
    return bookInfo
}

/**
 * 书籍列表
 *
 * @param {IncomingMessage} req
 * @param resp
 */
export default async function (req, resp) {
    let items =await bookList();
    resp.json(items);
}
