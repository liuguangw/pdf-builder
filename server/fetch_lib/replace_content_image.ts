import requestAPI from "./request_api";
import {ApiResponse, FetchedImageInfo, ImageApiRequest, ImageType} from "./common";
import ApiEndpoint from "./api_endpoint";

/**
 * 替换抓取的网页节点中的图片
 */
export default async function replaceContentImage(imgElement: HTMLImageElement, imgIndex: number, imgTotalCount: number,
                                                  progress: string, apiEndpointInfo: ApiEndpoint,
                                                  imageFetchList: FetchedImageInfo[]): Promise<void> {
    let imgSrcURL: string = imgElement.src
    let imgDistURL: string = ""
    //data URL不需要服务端fetch
    let isDataURL: boolean = (imgSrcURL.substring(0, 5) === "data:")
    let postData: ImageApiRequest = {
        bookName: apiEndpointInfo.projectName,
        progress: progress + " img(" + (imgIndex + 1) + "/" + imgTotalCount + ")",
        url: isDataURL ? "<data URL>" : imgSrcURL,
        imageType: isDataURL ? ImageType.DataURL : ImageType.Common
    }
    if (!isDataURL) {
        //判断是否已经抓取过了
        let fetchInfo: FetchedImageInfo = imageFetchList.find(item => item.url === imgSrcURL)
        //match到缓存
        if (fetchInfo !== undefined) {
            postData.imageType = ImageType.Exists
            imgDistURL = fetchInfo.data
        }
    }
    try {
        console.log("[" + postData.progress + "]fetch " + postData.url + " .....");
        let fetchImgResponse: ApiResponse = await requestAPI(apiEndpointInfo.imageApiURL, postData)
        //console.log(fetchImgResponse)
        if (fetchImgResponse.code !== 0) {
            console.error("[" + postData.progress + "]fetch " + postData.url + " failed: " + fetchImgResponse.message);
            return;
        }
        if (postData.imageType === ImageType.Common) {
            imgDistURL = fetchImgResponse.data
            //加入缓存
            let imgInfo: FetchedImageInfo = {
                url: imgSrcURL,
                data: fetchImgResponse.data
            }
            imageFetchList.push(imgInfo)
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
