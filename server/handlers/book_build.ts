import {projectDistDir, projectPdfPath} from "../lib/path_helper";
import {spawn} from "child_process";
import loadBookInfo from "../lib/load_book_info";
import {saveBookImage} from "./save_book_image";
import loadBookMetaInfo from "../lib/load_book_meta_info";
import {Server as SocketIoServer} from "socket.io";
import {Connect} from "vite";
import {IncomingMessage, ServerResponse} from "node:http";
import {readFile, writeFile} from 'node:fs/promises';
import {ApiRequest} from "../common/request";
import {readJson, writeErrorResponse, writeSuccessResponse} from "../lib/json_tools";
import {BookMetaInfo} from "../lib/common";
import moment from "moment";

//下载封面图
async function downloadCover(projectName: string, coverURL: string, referer: string) {
    let bookDistDir = projectDistDir(projectName);
    let saveFileName = await saveBookImage(bookDistDir, coverURL, referer);
    return bookDistDir + "/" + saveFileName
}

/**
 * 替换目录页的时间
 * @param inputPath
 */
async function replaceBuildTime(inputPath: string) {
    const buildTime = moment().format("Y-MM-DD HH:mm:ss(Z)")
    let menuHtml: string = await readFile(inputPath, {
        encoding: "utf-8"
    })
    menuHtml = menuHtml.replace(/<span\s+class="build-time">(.+?)<\/span>/,
        `<span class="build-time">[${buildTime}]</span>`);
    await writeFile(inputPath, menuHtml);
}

async function buildBook(io: SocketIoServer, projectName: string, docURL: string,
                         bookMetaInfo: BookMetaInfo, inputPath: string, outputPath: string) {
    io.emit("build-stdout", projectName, "build project " + projectName);
    await replaceBuildTime(inputPath);
    //console.log(bookInfo)
    //
    let params = [
        inputPath,
        outputPath,
        "--verbose",
        "--title=" + bookMetaInfo.title,
        "--authors=" + bookMetaInfo.authors,
        "--comments=" + bookMetaInfo.comments,
        "--language=" + bookMetaInfo.language,
        "--chapter-mark=pagebreak",
        "--page-breaks-before=/",
        "--paper-size=" + bookMetaInfo.paperSize,
        "--breadth-first",
        "--max-levels=1",
        "--no-chapters-in-toc",
        "--level1-toc=" + bookMetaInfo.tocLevel1,
        "--level2-toc=" + bookMetaInfo.tocLevel2,
        "--level3-toc=" + bookMetaInfo.tocLevel3,
        "--pdf-page-margin-left=" + bookMetaInfo.marginOption.left,
        "--pdf-page-margin-right=" + bookMetaInfo.marginOption.right,
        "--pdf-page-margin-top=" + bookMetaInfo.marginOption.top,
        "--pdf-page-margin-bottom=" + bookMetaInfo.marginOption.bottom,
        "--pdf-header-template=" + bookMetaInfo.headerTpl,
        "--pdf-footer-template=" + bookMetaInfo.footerTpl
    ];
    //添加封面
    const coverURL = bookMetaInfo.cover
    if (coverURL !== "") {
        //下载封面图
        io.emit("build-stdout", projectName, "download cover [" + coverURL + "] ....")
        try {
            let imagePath = await downloadCover(projectName, coverURL, docURL)
            params.push("--cover=" + imagePath)
            io.emit("build-stdout", projectName, "download cover success")
        } catch (e) {
            io.emit("build-failed", projectName, "download cover [" + coverURL + "] failed: " + e.message);
            return
        }
    }
    //console.log(params);
    let convert = spawn('ebook-convert', params);
    convert.stdout.on('data', (data) => {
        io.emit("build-stdout", projectName, `${data}`);
    });

    convert.stderr.on('data', (data) => {
        io.emit("build-stderr", projectName, `${data}`);
    });

    convert.on('close', (code) => {
        let codeResult = `${code}`;
        let message = "build process exited with code " + codeResult;
        if (codeResult === '0') {
            io.emit("build-success", projectName);
        } else {
            io.emit("build-failed", projectName, message);
        }
    });
}

/**
 * 构建pdf文档
 *
 */
export default function bookBuildHandler(io: SocketIoServer): Connect.SimpleHandleFunction {
    return async function (req: IncomingMessage, resp: ServerResponse) {
        let reqBody: ApiRequest = await readJson(req);
        let bookName = reqBody.bookName;
        let bookInfo = await loadBookInfo(bookName)
        if (bookInfo === null) {
            writeErrorResponse(resp, "book " + bookName + " not found");
            return;
        }
        let bookMetaInfo = await loadBookMetaInfo(bookInfo)
        let inputPath = projectDistDir(bookName) + "/__entry.html";
        let outputPath = projectPdfPath(bookName)
        try {
            await buildBook(io, bookName, bookInfo.docURL, bookMetaInfo, inputPath, outputPath);
        } catch (e) {
            writeErrorResponse(resp, e.message);
            io.emit("build-failed", bookName, e.message)
            return;
        }
        writeSuccessResponse(resp);
    }
}
