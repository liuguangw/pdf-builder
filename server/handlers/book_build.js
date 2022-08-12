import {projectDistDir, projectPdfPath} from "../lib/path_helper.js";
import {stat} from 'fs/promises';
import {spawn} from "child_process";
import loadBookInfo from "../lib/load_book_info.js";
import writeJson from "../lib/write_json.js";
import {saveBookImage} from "./save_book_image.js";

//下载封面图
async function downloadCover(bookInfo) {
    let bookDistDir = projectDistDir(bookInfo.projectName);
    let saveFileName = await saveBookImage(bookDistDir, bookInfo.cover, bookInfo.docURL);
    return bookDistDir + "/" + saveFileName
}

async function buildBook(io, bookInfo, inputPath, outputPath) {
    io.emit("build-stdout", bookInfo.projectName, "build project " + bookInfo.projectName);
    await stat(inputPath);
    //console.log(bookInfo)
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
        "--level1-toc=" + bookInfo.tocLevel1,
        "--level2-toc=" + bookInfo.tocLevel2,
        "--level3-toc=" + bookInfo.tocLevel3,
        "--pdf-page-margin-left=" + bookInfo.marginOption.left,
        "--pdf-page-margin-right=" + bookInfo.marginOption.right,
        "--pdf-page-margin-top=" + bookInfo.marginOption.top,
        "--pdf-page-margin-bottom=" + bookInfo.marginOption.bottom,
        "--pdf-header-template=" + bookInfo.headerTpl,
        "--pdf-footer-template=" + bookInfo.footerTpl
    ];
    //添加封面
    if (bookInfo.cover !== "") {
        //下载封面图
        io.emit("build-stdout", bookInfo.projectName, "download cover [" + bookInfo.cover + "] ....")
        try {
            let imagePath = await downloadCover(bookInfo)
            params.push("--cover=" + imagePath)
            io.emit("build-stdout", bookInfo.projectName, "download cover success")
        } catch (e) {
            io.emit("build-failed", bookInfo.projectName, "download cover [" + bookInfo.cover + "] failed: " + e.message);
            return
        }
    }
    //console.log(params);
    let convert = spawn('ebook-convert', params);
    convert.stdout.on('data', (data) => {
        io.emit("build-stdout", bookInfo.projectName, `${data}`);
    });

    convert.stderr.on('data', (data) => {
        io.emit("build-stderr", bookInfo.projectName, `${data}`);
    });

    convert.on('close', (code) => {
        let codeResult = `${code}`;
        let message = "build process exited with code " + codeResult;
        if (codeResult === '0') {
            io.emit("build-success", bookInfo.projectName);
        } else {
            io.emit("build-failed", bookInfo.projectName, message);
        }
    });
}

/**
 * 构建pdf文档
 *
 */
export default function bookBuildHandler(io) {
    return async function (req, resp) {
        let bookName = req.body.bookName;
        let bookInfo = loadBookInfo(bookName, true)
        if (bookInfo === null) {
            writeJson(resp, {
                code: 4000,
                data: null,
                message: "book " + bookName + " not found"
            });
            return;
        }
        let inputPath = projectDistDir(bookName) + "/__entry.html";
        let outputPath = projectPdfPath(bookName)
        try {
            await buildBook(io, bookInfo, inputPath, outputPath);
        } catch (e) {
            writeJson(resp, {
                code: 4000,
                data: null,
                message: e.message
            });
            io.emit("build-failed", bookName, e.message)
            return;
        }
        writeJson(resp, {
            code: 0,
            data: null,
            message: ""
        });
    }
}
