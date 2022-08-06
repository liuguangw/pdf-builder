import kratos from "../projects/kratos/main.js";
import rustbook from "../projects/rustbook/main.js"
import viteBook from "../projects/vite/main.js"
import laravel from "../projects/laravel/main.js"
import {readFile} from "fs/promises"
import {projectDir} from "./path_helper.js";

async function addFetchScript(bookInfo) {
    let fetchJsPath = projectDir(bookInfo.projectName) + "/fetch.js";
    try {
        bookInfo.fetchScript = await readFile(fetchJsPath, {
            encoding: "utf-8"
        });
    } catch (e) {
        bookInfo.fetchScript = "";
        console.error(e);
    }
    return bookInfo;
}

function addMetaInfo(bookInfo) {
    if (!("authors" in bookInfo)) {
        bookInfo.authors = "流光";
    }
    if (!("comments" in bookInfo)) {
        bookInfo.comments = "此文档由流光整理制作 by https://github.com/liuguangw/pdf-builder";
    }
    if (!("language" in bookInfo)) {
        bookInfo.language = "zh-hans";
    }
    if (!("paperSize" in bookInfo)) {
        bookInfo.paperSize = "a4";
    }
    if (!("tocXpath" in bookInfo)) {
        bookInfo.tocXpath = {
            level1: "//h:h1",
            level2: "//h:h2",
            level3: "//h:h3"
        };
    }
    if (!("marginOption" in bookInfo)) {
        bookInfo.marginOption = {
            left: 18,
            right: 18,
            top: 38,
            bottom: 38
        };
    }
    if (!("headerTpl" in bookInfo)) {
        bookInfo.headerTpl = '<div style="margin:12px 0;padding-bottom: 10px;width:100%;position:relative;border-bottom: 1px solid #eee;color: #5c6163;font-size:14px;">' +
            '<div>_SECTION_</div>' +
            '<span style="display: inline-block;position:absolute;right:0;bottom:12px;">第 _PAGENUM_ 页</span>' +
            '</div>';
    }
    if (!("footerTpl" in bookInfo)) {
        bookInfo.footerTpl = '<div style="margin:12px 0;padding-top: 10px;width:100%;position:relative;border-top: 1px solid #eee;color: #5c6163;font-size:14px;">' +
            '<div>_SECTION_</div>' +
            '<span style="display: inline-block;position:absolute;right:0;top:12px;">第 _PAGENUM_ 页</span>' +
            '</div>';
    }
    return bookInfo;
}

/**
 * 加载书籍信息列表
 *
 * @return {Promise<Object[]>}
 */
export default async function loadBookList() {
    let bookList = [];
    bookList.push(kratos(), rustbook(), viteBook(), laravel());
    for (let bookIndex in bookList) {
        let bookInfo = bookList[bookIndex];
        bookInfo = await addFetchScript(bookInfo);
        bookInfo = addMetaInfo(bookInfo);
        bookList[bookIndex] = bookInfo;
    }
    return bookList;
}
