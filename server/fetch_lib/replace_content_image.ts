import requestAPI from "./request_api";
import {ApiResponse, FetchedImageInfo, ImageApiRequest, ImageType} from "./common";
import ApiEndpoint from "./api_endpoint";

async function processFetchImage(apiEndpointInfo: ApiEndpoint, postData: ImageApiRequest,
                                 imgElement: HTMLImageElement, imageFetchList: FetchedImageInfo[]) {
    let fetchImgResponse: ApiResponse = await requestAPI(apiEndpointInfo.imageApiURL, postData)
    //console.log(fetchImgResponse)
    if (fetchImgResponse.code !== 0) {
        throw new Error(fetchImgResponse.message)
    } else if (postData.imageType === ImageType.Common) {
        //下载成功
        imgElement.src = fetchImgResponse.data
        //加入缓存
        let imgInfo: FetchedImageInfo = {
            url: postData.url,
            data: fetchImgResponse.data
        }
        imageFetchList.push(imgInfo)
    }
}

/**
 * 替换抓取的网页节点中的图片
 */
export default async function replaceContentImage(imgElement: HTMLImageElement, imgProgress: string,
                                                  pageURL: string, apiEndpointInfo: ApiEndpoint,
                                                  imageFetchList: FetchedImageInfo[]): Promise<void> {
    let imgSrcURL: string = imgElement.getAttribute("src")
    if (imgSrcURL === null || imgSrcURL === "") {
        return
    }
    //data URL不需要服务端fetch
    let isDataURL: boolean = imgSrcURL.startsWith("data:")
    if (!isDataURL) {
        //处理相对路径的图片地址
        if (!(imgSrcURL.startsWith("http://") || imgSrcURL.startsWith("https://"))) {
            let imgURLInfo = new URL(imgSrcURL, pageURL)
            imgSrcURL = imgURLInfo.toString()
        }
    }
    let postData: ImageApiRequest = {
        bookName: apiEndpointInfo.projectName,
        progress: imgProgress,
        url: isDataURL ? "<data URL>" : imgSrcURL,
        imageType: isDataURL ? ImageType.DataURL : ImageType.Common
    }
    if (!isDataURL) {
        //判断是否已经抓取过了
        let fetchInfo: FetchedImageInfo = imageFetchList.find(item => item.url === imgSrcURL)
        //match到缓存
        if (fetchInfo !== undefined) {
            postData.imageType = ImageType.Exists
            imgElement.src = fetchInfo.data
        }
    }
    //抓取图片的最大尝试次数
    const maxTryCount = 4
    let fetchErr: Error = null
    let logPrefix = "[" + postData.progress + "]fetch " + postData.url
    if (postData.imageType === ImageType.Common) {
        console.log(logPrefix + " .....");
    }
    for (let tryCount = 1; tryCount <= maxTryCount; tryCount++) {
        try {
            await processFetchImage(apiEndpointInfo, postData, imgElement, imageFetchList)
            break
        } catch (ex) {
            if (tryCount === maxTryCount) {
                fetchErr = ex
            } else {
                console.error(logPrefix + " failed(#try" + tryCount + "): " + ex.message);
            }
        }
    }
    if (fetchErr !== null) {
        console.error(logPrefix + " failed: " + fetchErr.message);
        return
    }
    if (postData.imageType === ImageType.Common) {
        console.log(logPrefix + " success");
    } else {
        console.log(logPrefix + " skip");
    }
}
