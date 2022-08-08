import replaceURL from "./replace_url";
import replaceContentImage from "./replace_content_image";
import {FetchedImageInfo} from "./common";
import ApiEndpoint from "./api_endpoint";

/**
 * 抓取到网页内容后的一些通用处理过程
 */
export default async function processPage(contentEl: HTMLElement, contextURL: string, progress: string,
                                          apiEndpointInfo: ApiEndpoint, imageFetchList: FetchedImageInfo[]): Promise<void> {
    //a标签链接替换
    contentEl.querySelectorAll("a").forEach(aElement => {
        if (aElement.href === "") {
            return
        }
        aElement.href = replaceURL(aElement.href, contextURL)
    })
    //通知服务端下载内容中的图片

    let imageNodeList = contentEl.querySelectorAll("img")
    for (let imgIndex = 0; imgIndex < imageNodeList.length; imgIndex++) {
        let imgElement = imageNodeList.item(imgIndex)
        await replaceContentImage(imgElement, imgIndex, imageNodeList.length, progress, apiEndpointInfo, imageFetchList);
    }
}
