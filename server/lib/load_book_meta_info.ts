import {BookInfo, BookMetaInfo} from "./common";

/**
 * 加载meta信息
 *
 * @param bookInfo
 */
export default function loadBookMetaInfo(bookInfo: BookInfo): BookMetaInfo {
    const metaInfo: BookMetaInfo = {
        title: "未命名书籍",
        authors: "流光",
        cover: "",
        comments: "此文档由流光整理制作 by https://github.com/liuguangw/pdf-builder",
        language: "zh-hans",
        paperSize: "a4",
        tocLevel1: "//*[@class=\"pdf-toc1\"]",
        tocLevel2: "//*[@class=\"pdf-toc2\"]",
        tocLevel3: "//*[@class=\"pdf-toc3\"]",
        marginOption: {
            left: 18,
            right: 18,
            top: 38,
            bottom: 38
        },
        headerTpl: '<div style="border-bottom: 1px solid #eee;color: #5c6163;padding: 8px 0;position:relative;font-size:14px;height:20px;line-height:20px;">' +
            '<span style="display:inline-block;position:absolute;height:20px;left:0;top:8px;">_SECTION_</span>' +
            '<span style="display:inline-block;position:absolute;height:20px;right:0;top:8px;">第 _PAGENUM_ 页</span>' +
            '</div>',
        footerTpl: '<div style="border-top: 1px solid #eee;color: #5c6163;padding: 8px 0;position:relative;font-size:14px;height:20px;line-height:20px;">' +
            '<span style="display:inline-block;position:absolute;height:20px;left:0;bottom:8px;">_SECTION_</span>' +
            '<span style="display:inline-block;position:absolute;height:20px;right:0;bottom:8px;">第 _PAGENUM_ 页</span>' +
            '</div>'
    }
    return Object.assign(metaInfo, bookInfo)
}
