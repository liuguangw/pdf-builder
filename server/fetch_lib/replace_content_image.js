/**
 * 替换抓取的网页节点中的图片
 *
 * @param {HTMLElement} contentEl
 * @param {string} progress
 * @param {Object} apiEndpointInfo
 * @return {Promise<void>}
 */
export default async function replaceContentImage(contentEl, progress,apiEndpointInfo) {
    let imageNodeList = contentEl.querySelectorAll("img")
    for (let imgIndex = 0; imgIndex < imageNodeList.length; imgIndex++) {
        let imgElement = imageNodeList.item(imgIndex)
        let imgSrcURL = imgElement.src
        let isDataURL = (imgSrcURL.substring(0, 5) === "data:")
        let postData = {
            "progress": progress + " img(" + (imgIndex + 1) + "/" + imageNodeList.length + ")",
            "url": isDataURL ? "<data URL>" : imgSrcURL
        }
        try {
            let saveMenuResponse = await window.axios.post(apiEndpointInfo.imageApiURL, postData)
            if (saveMenuResponse.data.code !== 0) {
                console.error("[" + postData.progress + "]fetch " + postData.url + " failed: " + saveMenuResponse.data.message);
                return;
            }
            console.log("[" + postData.progress + "]fetch " + postData.url + " success")
            if (!isDataURL) {
                imgElement.src = saveMenuResponse.data.data
            }
        } catch (e) {
            console.error("[" + postData.progress + "]fetch " + postData.url + " failed: " + e.message)
        }
    }
}
