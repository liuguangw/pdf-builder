/**
 * 替换url为一级文件名
 * @param fullURL 完整url地址
 * @param contextURL 网页context url
 */
export default function replaceURL(fullURL: string, contextURL: string): string {
    //如果后缀不是/,则补上/
    if (contextURL.charAt(contextURL.length - 1) !== "/") {
        contextURL += "/"
    }
    //将url和hash分开
    let itemURL = fullURL;
    let itemHash = "";
    let pos = itemURL.indexOf("#")
    if (pos !== -1) {
        itemHash = itemURL.substring(pos)
        itemURL = itemURL.substring(0, pos)
    }
    //额外的path部分
    let pathname = "";
    if ((itemURL !== contextURL) && (itemURL + "/" !== contextURL)) {
        //判断是否为外部URL
        pos = itemURL.indexOf(contextURL)
        if (pos !== 0) {
            return fullURL
        }
        pathname = itemURL.substring(contextURL.length)
    }
    if (pathname.endsWith("/")) {
        pathname = pathname.substring(0, pathname.length - 1)
    }
    if (pathname === "") {
        pathname = "_index.html";
    } else if (!pathname.endsWith(".html")) {
        pathname += ".html"
    }
    pathname = pathname.replace(/\//g, "-").replace(/%/g, "")
    return pathname + itemHash
}
