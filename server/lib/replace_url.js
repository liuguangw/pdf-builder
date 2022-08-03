import {URL} from 'url';

/**
 * 替换url为一级文件名
 * @param {String} fullURL
 * @param {String} contextURL
 * @return {String}
 */
export default function (fullURL, contextURL) {
    if (fullURL === contextURL) {
        return "index.html"
    }
    let pos = fullURL.indexOf(contextURL)
    //外部url
    if (pos === -1) {
        return fullURL
    }
    //解析url
    let urlInfo = new URL(fullURL)
    //替换
    urlInfo.pathname = "/" + urlInfo.pathname.substring(1).replaceAll("/", "-")
    if (!urlInfo.pathname.endsWith(".html")) {
        urlInfo.pathname += ".html"
    }
    return urlInfo.toString().substring(contextURL.length)
}
