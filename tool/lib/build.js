const {spawn} = require('child_process');
const fse = require('fs-extra');
const path = require('path');
const iconv = require('iconv-lite');
const isWindow = require('os').type().toLowerCase().indexOf('windows') === 0;
let systemCharset = "utf-8";
if (isWindow) {
    systemCharset = "gbk";
}

function doBuildBook(bookInfo, successFn, errorFn, buildCompleteFn) {
    let inputFile = bookInfo.entryFile;
    let outputFile = path.resolve(path.dirname(inputFile), "../output.pdf");
    let params = [
        inputFile,
        outputFile,
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
    let convert = spawn('ebook-convert', params);
    convert.stdout.on('data', (data) => {
        let str = iconv.decode(Buffer.from(data), systemCharset);
        successFn(str);
    });

    convert.stderr.on('data', (data) => {
        let str = iconv.decode(Buffer.from(data), systemCharset);
        errorFn(str);
    });

    convert.on('close', (code) => {
        let codeResult = `${code}`;
        let message = "build process exited with code " + codeResult;
        if (codeResult === '0') {
            successFn(message);
        } else {
            errorFn(message)
        }
        buildCompleteFn();
    });
}

function buildBook(bookInfo, successFn, errorFn, buildCompleteFn) {

    //判断入口文件的存在性
    fse.pathExists(bookInfo.entryFile, (err, exists) => {
        if (err) {
            errorFn(err.message);
        } else if (exists) {
            doBuildBook(bookInfo, successFn, errorFn, buildCompleteFn);
        } else {
            errorFn("入口文件: " + bookInfo.entryFile + "不存在");
        }
    })

}

module.exports = buildBook;