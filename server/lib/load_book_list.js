import kratos from "../projects/kratos/main.js";
import rustbook from "../projects/rustbook/main.js"
import viteBook from "../projects/vite/main.js"
import laravel from "../projects/laravel/main.js"
import {projectDir} from "./path_helper.js";
import esbuild from "esbuild"

export async function addFetchScript(bookInfo) {
    let fetchJsPath = projectDir(bookInfo.projectName) + "/fetch.js";
    try {
        let buildResult = await esbuild.build({
            entryPoints: [fetchJsPath],
            bundle: true,
            //minify: true,
            write: false,
            target: ["chrome87", "firefox78"]
        })
        let buildItemResult = buildResult.outputFiles.pop();
        bookInfo.fetchScript = buildItemResult.text;
    } catch (e) {
        bookInfo.fetchScript = "";
        console.error(e);
    }
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
        bookInfo.headerTpl = '<div style="border-bottom: 1px solid #eee;color: #5c6163;padding: 8px 0;position:relative;font-size:14px;height:20px;line-height:20px;">' +
            '<span style="display:inline-block;position:absolute;height:20px;left:0;top:8px;">_SECTION_</span>' +
            '<span style="display:inline-block;position:absolute;height:20px;right:0;top:8px;">第 _PAGENUM_ 页</span>' +
            '</div>';
    }
    if (!("footerTpl" in bookInfo)) {
        bookInfo.footerTpl = '<div style="border-top: 1px solid #eee;color: #5c6163;padding: 8px 0;position:relative;font-size:14px;height:20px;line-height:20px;">' +
            '<span style="display:inline-block;position:absolute;height:20px;left:0;bottom:8px;">_SECTION_</span>' +
            '<span style="display:inline-block;position:absolute;height:20px;right:0;bottom:8px;">第 _PAGENUM_ 页</span>' +
            '</div>';
    }
}

/**
 * 加载基本的book信息列表
 *
 * @return {Object[]}
 */
export function loadBaseBookList() {
    return [
        kratos(), rustbook(), viteBook(), laravel()
    ]
}

/**
 * 加载书籍信息列表
 *
 * @return {Promise<Object[]>}
 */
export default async function loadBookList() {
    let bookList = loadBaseBookList()
    for (let bookInfo of bookList) {
        await addFetchScript(bookInfo);
        addMetaInfo(bookInfo);
    }
    return bookList;
}
