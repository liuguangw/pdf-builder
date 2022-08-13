import replaceContentImage from "./replace_content_image";
import {FetchedImageInfo, ReplaceURLHandler} from "./common";
import ApiEndpoint from "./api_endpoint";

//a标签链接替换
export function processPageLinks(contentEl: HTMLElement, replaceURLHandler: ReplaceURLHandler,
                                 pageURL: string, contextURL: string) {
    contentEl.querySelectorAll("a").forEach(linkElement => {
        //已标记为非内部链接
        if (linkElement.classList.contains("pdf-no-inner-link")) {
            return;
        }
        let hrefValue = linkElement.getAttribute("href")
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
        linkElement.href = replaceURLHandler(linkURLInfo.href, contextURL)
    })
}

//标记文档pdf目录
export function processPageToc(contentEl: HTMLElement, pageDeep: number) {
    let currentDeep = pageDeep
    //找出h1 - h6
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
}

//通知服务端下载内容中的图片
export async function processPageImages(contentEl: HTMLElement, progress: string, pageURL: string,
                                        apiEndpointInfo: ApiEndpoint, imageFetchList: FetchedImageInfo[]): Promise<void> {
    //通知服务端下载内容中的图片
    let imageNodeList = contentEl.querySelectorAll("img")
    let imgTotalCount = imageNodeList.length
    for (let imgIndex = 0; imgIndex < imgTotalCount; imgIndex++) {
        let imgElement = imageNodeList.item(imgIndex)
        let imgProgress = progress + " img(" + (imgIndex + 1) + "/" + imgTotalCount + ")"
        await replaceContentImage(imgElement, imgProgress, pageURL, apiEndpointInfo, imageFetchList);
    }
}
