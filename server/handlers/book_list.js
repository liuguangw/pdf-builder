import kratos from "../projects/kratos/main.js";
import rustbook from "../projects/rustbook/main.js"

/**
 * 书籍列表
 *
 * @param {IncomingMessage} req
 * @param resp
 */
export default function (req,resp){
    let bookList =[];
    bookList.push(kratos(),rustbook());
    resp.json(bookList);
}
