import {readdir} from 'fs/promises';
import loadBookInfo from "./load_book_info.js";
import {projectListDir} from "./path_helper.js";

/**
 * 加载基本的book信息列表
 *
 * @return {Promise<Object[]>}
 */
export default async function loadBookList() {
    const projectsDir = projectListDir()
    const bookList = [];
    try {
        //扫描目录
        const files = await readdir(projectsDir);
        for (const dirName of files) {
            const bookInfo = await loadBookInfo(dirName)
            if (bookInfo !== null) {
                bookList.push(bookInfo)
            }
        }
    } catch (err) {
        console.error(err);
    }
    //按order倒序
    return bookList.sort((bodeNodeA, bodeNodeB) => {
        //console.log(bodeNodeA.order + " vs " + bodeNodeB.order)
        if (bodeNodeA.order === bodeNodeB.order) {
            return 0
        }
        return bodeNodeA.order > bodeNodeB.order ? -1 : 1
    })
}
