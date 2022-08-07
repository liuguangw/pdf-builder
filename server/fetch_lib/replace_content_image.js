/**
 * 替换抓取的网页节点中的图片
 *
 * @param {HTMLImageElement} imgElement
 * @param {Number} imgIndex
 * @param {Number} imgTotalCount
 * @param {string} progress
 * @param {Object} apiEndpointInfo
 * @param {Object[]} imageFetchList
 * @return {Promise<void>}
 */
import requestAPI from "./request_api.js";

export default async function replaceContentImage(imgElement, imgIndex, imgTotalCount, progress, apiEndpointInfo, imageFetchList) {
    let imgSrcURL = imgElement.src
    let imgDistURL = ""
    //data URL不需要服务端fetch
    let isDataURL = (imgSrcURL.substring(0, 5) === "data:")
    let postData = {
        "progress": progress + " img(" + (imgIndex + 1) + "/" + imgTotalCount + ")",
        "url": isDataURL ? "<data URL>" : imgSrcURL,
        "type": isDataURL ? 1 : 0
    }
    if (!isDataURL) {
        //判断是否已经抓取过了
        let fetchInfo = imageFetchList.find(item => item.url === imgSrcURL)
        //match到缓存
        if (fetchInfo !== undefined) {
            postData.type = 1
            imgDistURL = fetchInfo.data
        }
    }
    try {
        let fetchImgResponse = await requestAPI(apiEndpointInfo.imageApiURL, postData)
        //console.log(fetchImgResponse)
        if (fetchImgResponse.code !== 0) {
            console.error("[" + postData.progress + "]fetch " + postData.url + " failed: " + fetchImgResponse.message);
            return;
        }
        if (postData.type === 0) {
            imgDistURL = fetchImgResponse.data
            //加入缓存
            imageFetchList.push({
                url: imgSrcURL,
                data: fetchImgResponse.data
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
