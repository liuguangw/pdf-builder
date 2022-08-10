import replaceContentImage from "./replace_content_image";
import {FetchedImageInfo, ReplaceURLHandler} from "./common";
import ApiEndpoint from "./api_endpoint";

/**
 * 抓取到网页内容后的一些通用处理过程
 */
export default async function processPage(contentEl: HTMLElement, pageURL: string, pageDeep: number,
                                          contextURL: string, replaceURLHandler: ReplaceURLHandler,
                                          progress: string, apiEndpointInfo: ApiEndpoint,
                                          imageFetchList: FetchedImageInfo[]): Promise<void> {
    //a标签链接替换
    contentEl.querySelectorAll("a").forEach(aElement => {
        let hrefValue = aElement.getAttribute("href")
        if (hrefValue === null) {
            return
        }
        if (hrefValue !== "") {
            // 以#开头的
            if (hrefValue.substring(0, 1) === "#") {
                return
            }
        }
        //计算完整URL
        let linkURLInfo = new URL(hrefValue, pageURL)
        aElement.href = replaceURLHandler(linkURLInfo.href, contextURL)
    })
    //找出h1 - h6
    let currentDeep = pageDeep
    for (let i = 1; i < 7; i++) {
        let tagName = "h" + i
        //排除.pdf-no-toc
        let hNodeList = contentEl.querySelectorAll(tagName + ":not(.pdf-no-toc)")
        if (hNodeList.length > 0) {
            //添加标题class属性
            let hClassName = "pdf-toc" + currentDeep
            hNodeList.forEach(hNode => {
                hNode.className = hClassName
            })
            currentDeep++
        }
    }
    //通知服务端下载内容中的图片
    let imageNodeList = contentEl.querySelectorAll("img")
    for (let imgIndex = 0; imgIndex < imageNodeList.length; imgIndex++) {
        let imgElement = imageNodeList.item(imgIndex)
        await replaceContentImage(imgElement, imgIndex, imageNodeList.length, progress, apiEndpointInfo, imageFetchList);
    }
}
