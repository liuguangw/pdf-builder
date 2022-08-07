/**
 * 替换抓取的网页节点中的图片
 *
 * @param {HTMLElement} contentEl
 * @param {string} progress
 * @param {Object} apiEndpointInfo
 * @param {Object[]} imageFetchList
 * @return {Promise<void>}
 */
export default async function replaceContentImage(contentEl, progress, apiEndpointInfo, imageFetchList) {
    let imageNodeList = contentEl.querySelectorAll("img")
    for (let imgIndex = 0; imgIndex < imageNodeList.length; imgIndex++) {
        let imgElement = imageNodeList.item(imgIndex)
        let imgSrcURL = imgElement.src
        let imgDistURL = ""
        let isDataURL = (imgSrcURL.substring(0, 5) === "data:")
        let postData = {
            "progress": progress + " img(" + (imgIndex + 1) + "/" + imageNodeList.length + ")",
            "url": isDataURL ? "<data URL>" : imgSrcURL,
            "type": 0
        }
        //data URL不需要服务端fetch
        if (isDataURL) {
            postData.type = 1
        } else {
            //判断是否已经抓取过了
            let fetchInfo = imageFetchList.find(item => item.url === imgSrcURL)
            if (fetchInfo !== undefined) {
                postData.type = 1
                imgDistURL = fetchInfo.data
            }
        }
        try {
            let saveMenuResponse = await window.axios.post(apiEndpointInfo.imageApiURL, postData)
            if (saveMenuResponse.data.code !== 0) {
                console.error("[" + postData.progress + "]fetch " + postData.url + " failed: " + saveMenuResponse.data.message);
                return;
            }
            if (postData.type === 0) {
                imgDistURL = saveMenuResponse.data.data
                //加入缓存
                imageFetchList.push({
                    url: imgSrcURL,
                    data: saveMenuResponse.data.data
                })
                console.log("[" + postData.progress + "]fetch " + postData.url + " success")
            } else {
                console.log("[" + postData.progress + "]fetch " + postData.url + " skip")
            }
            if (imgDistURL !== "") {
                imgElement.src = imgDistURL
            }
        } catch (e) {
            console.error("[" + postData.progress + "]fetch " + postData.url + " failed: " + e.message)
        }
    }
}
