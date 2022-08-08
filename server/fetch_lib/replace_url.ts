/**
 * 替换url为一级文件名
 * @param fullURL 完整url地址
 * @param contextURL 网页context url
 */
export default function replaceURL(fullURL:string, contextURL:string):string{
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
    urlInfo.pathname = "/" + urlInfo.pathname.substring(1).replace(/\//g, "-")
    if (!urlInfo.pathname.endsWith(".html")) {
        urlInfo.pathname += ".html"
    }
    return decodeURI(urlInfo.toString().substring(contextURL.length))
}
