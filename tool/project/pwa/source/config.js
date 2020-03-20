const path = require("path");
const fs = require("fs");

let bookConfig = {
    title: "PWA 文档",
    authors: "流光",
    comments: "此文档由流光整理制作 by https://github.com/liuguangw/pdf-builder",
    language: "zh-hans",
    paperSize: "a4",
    tocXpath: {
        level1: "//h:title",
        level2: "//h:h2",
        level3: "//h:h3"
    },
    marginOption: {
        left: 18,
        right: 18,
        top: 38,
        bottom: 38
    },
    headerTpl: '<div style="margin:12px 0;padding-bottom: 10px;width:100%;position:relative;border-bottom: 1px solid #eee;color: #5c6163;font-size:14px;">' +
        '<div>_SECTION_</div>' +
        '<span style="display: inline-block;position:absolute;right:0;bottom:12px;">第 _PAGENUM_ 页</span>' +
        '</div>',
    footerTpl: '<div style="margin:12px 0;padding-top: 10px;width:100%;position:relative;border-top: 1px solid #eee;color: #5c6163;font-size:14px;">' +
        '<div>_SECTION_</div>' +
        '<span style="display: inline-block;position:absolute;right:0;top:12px;">第 _PAGENUM_ 页</span>' +
        '</div>',
    entryFile: path.resolve(__dirname, '../dist/__entry.html'),
    fetchPage: "https://lavas.baidu.com/pwa/",
    fetchScriptSource: "",
    outputName: "pwa-doc.pdf"
};
fs.readFile(path.resolve(__dirname, '../fetch.js'), 'utf8', (err, data) => {
    if (err) {
        bookConfig.fetchScriptSource = "[read error]" + err.message;
    } else {
        bookConfig.fetchScriptSource = data;
    }
});

module.exports = () => {
    return bookConfig;
};