import replaceURL from "./replace_url.js";
import replaceContentImage from "./replace_content_image.js";

/**
 * 抓取到网页内容后的一些通用处理过程
 * @param {HTMLElement} contentEl
 * @param {string} contextURL
 * @param {string} progress
 * @param {string} apiEndpointInfo
 * @return {Promise<void>}
 */
export default async function processPage(contentEl,contextURL,progress,apiEndpointInfo) {
    //a标签链接替换
    {
        let aList = contentEl.querySelectorAll("a");
        for (let i = 0; i < aList.length; i++) {
            let aEl = aList.item(i);
            aEl.href = replaceURL(aEl.href, contextURL)
        }
    }
    //通知服务端下载内容中的图片
    await replaceContentImage(contentEl,progress,apiEndpointInfo);
}
