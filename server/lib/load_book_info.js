import loadBookList from "./load_book_list.js";
import {projectDir} from "./path_helper.js";
import esbuild from "esbuild";

//附加fetchScript属性
export async function addFetchScript(bookInfo, serverURL) {
    let fetchJsPath = projectDir(bookInfo.projectName) + "/fetch.js";
    let sBookInfo = {
        docURL: bookInfo.docURL,
        contextURL: bookInfo.contextURL === undefined ? bookInfo.docURL : bookInfo.contextURL,
        projectName: bookInfo.projectName
    }
    try {
        let buildResult = await esbuild.build({
            entryPoints: [fetchJsPath],
            bundle: true,
            define: {
                VITE_SERVER_URL: JSON.stringify(serverURL),
                BOOK_PROJECT_INFO: JSON.stringify(sBookInfo)
            },
            //minify: true,
            write: false,
            target: ["chrome87", "firefox78"]
        })
        let buildItemResult = buildResult.outputFiles.pop();
        bookInfo.fetchScript = buildItemResult.text;
    } catch (e) {
        bookInfo.fetchScript = "[ERROR] " + e.message;
        console.error(e);
    }
}

function addMetaInfo(bookInfo) {
    if (!("authors" in bookInfo)) {
        bookInfo.authors = "流光";
    }
    if (!("cover" in bookInfo)) {
        bookInfo.cover = "";
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
    if (!("tocLevel1" in bookInfo)) {
        bookInfo.tocLevel1 = "//*[@class=\"pdf-toc1\"]"
    }
    if (!("tocLevel2" in bookInfo)) {
        bookInfo.tocLevel2 = "//*[@class=\"pdf-toc2\"]"
    }
    if (!("tocLevel3" in bookInfo)) {
        bookInfo.tocLevel3 = "//*[@class=\"pdf-toc3\"]"
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
 * 获取book信息
 *
 * @param {string} bookName
 * @param {boolean} withMetaInfo 是否加载meta信息
 * @return {Object}
 */
export default function loadBookInfo(bookName, withMetaInfo = false) {
    let items = loadBookList();
    let bookInfo = items.find(itemInfo => itemInfo.projectName === bookName)
    if (bookInfo === undefined) {
        return null
    }
    if (withMetaInfo) {
        addMetaInfo(bookInfo)
    }
    return bookInfo
}
