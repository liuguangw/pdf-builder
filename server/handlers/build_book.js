import loadBookInfo from "../lib/load_book_info.js";
import {projectDistDir, projectPdfPath} from "../lib/path_helper.js";
import {stat} from 'fs/promises';
import {spawn} from "child_process";
import iconv from "iconv-lite";
import os from "os";
const isWindow = os.type().toLowerCase().indexOf('windows') === 0;
let systemCharset = "utf8";
if (isWindow) {
    systemCharset = "gbk";
}

async function buildBook(bookInfo,inputPath, outputPath) {
    console.log("build project " + bookInfo.projectName);
    await stat(inputPath);
    //
    let params = [
        inputPath,
        outputPath,
        "--verbose",
        "--title=" + bookInfo.title,
        "--authors=" + bookInfo.authors,
        "--comments=" + bookInfo.comments,
        "--language=" + bookInfo.language,
        "--chapter-mark=pagebreak",
        "--page-breaks-before=/",
        "--paper-size=" + bookInfo.paperSize,
        "--breadth-first",
        "--max-levels=1",
        "--no-chapters-in-toc",
        "--level1-toc=" + bookInfo.tocXpath.level1,
        "--level2-toc=" + bookInfo.tocXpath.level2,
        "--level3-toc=" + bookInfo.tocXpath.level3,
        "--pdf-page-margin-left=" + bookInfo.marginOption.left,
        "--pdf-page-margin-right=" + bookInfo.marginOption.right,
        "--pdf-page-margin-top=" + bookInfo.marginOption.top,
        "--pdf-page-margin-bottom=" + bookInfo.marginOption.bottom,
        "--pdf-header-template=" + bookInfo.headerTpl,
        "--pdf-footer-template=" + bookInfo.footerTpl
    ];
    //console.log(params);
    let convert = spawn('ebook-convert', params);
    convert.stdout.on('data', (data) => {
        let str = iconv.decode(Buffer.from(data), systemCharset);
        console.log(str);
    });

    convert.stderr.on('data', (data) => {
        let str = iconv.decode(Buffer.from(data), systemCharset);
        console.error(str);
    });

    convert.on('close', (code) => {
        let codeResult = `${code}`;
        let message = "build process exited with code " + codeResult;
        if (codeResult === '0') {
            console.log(message)
        } else {
            console.error(message)
        }
    });
}

/**
 * 保存网页内容
 *
 * @param {IncomingMessage} req
 * @param resp
 */
export default async function buildBookHandler(req, resp) {
    let bookName = req.params.bookName;
    let bookInfo = await loadBookInfo(bookName)
    if (bookInfo === null) {
        resp.json({
            code: 4000,
            data: null,
            message: "book " + bookName + " not found"
        });
        return;
    }
    let inputPath = projectDistDir(bookName)+"/__entry.html";
    let outputPath = projectPdfPath(bookName)
    try {
        await buildBook(bookInfo, inputPath, outputPath);
    } catch (e) {
        resp.json({
            code: 4000,
            data: null,
            message: e.message
        });
        return;
    }
    resp.json({
        code: 0,
        data: null,
        message: ""
    });
}
