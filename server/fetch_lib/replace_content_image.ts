import requestAPI from './request_api'
import { FetchedImageInfo } from './common'
import ApiEndpoint from './api_endpoint'
import { ImageApiRequest, ImageType } from '../common/request'
import { ApiResponse } from '../common/response'

async function processFetchImage(
  apiEndpointInfo: ApiEndpoint,
  postData: ImageApiRequest,
  imgElement: HTMLImageElement,
  imageFetchList: FetchedImageInfo[]
) {
  const fetchImgResponse: ApiResponse<string> = await requestAPI(apiEndpointInfo.imageApiURL, postData)
  //console.log(fetchImgResponse)
  if (fetchImgResponse.code !== 0) {
    throw new Error(fetchImgResponse.message)
  } else if (postData.imageType === ImageType.Common) {
    //下载成功
    imgElement.src = fetchImgResponse.data
    //加入缓存
    const imgInfo: FetchedImageInfo = {
      url: postData.url,
      data: fetchImgResponse.data
    }
    imageFetchList.push(imgInfo)
  }
}

/**
 * 替换抓取的网页节点中的图片
 */
export default async function replaceContentImage(
  imgElement: HTMLImageElement,
  imgProgress: string,
  pageURL: string,
  apiEndpointInfo: ApiEndpoint,
  imageFetchList: FetchedImageInfo[]
): Promise<void> {
  let imgSrcURL: string = imgElement.getAttribute('src') ?? imgElement.getAttribute('data-src') ?? ''
  if (imgSrcURL === '') {
    return
  }
  //data URL不需要服务端fetch
  const isDataURL: boolean = imgSrcURL.startsWith('data:')
  if (!isDataURL) {
    //处理相对路径的图片地址
    if (!(imgSrcURL.startsWith('http://') || imgSrcURL.startsWith('https://'))) {
      const imgURLInfo = new URL(imgSrcURL, pageURL)
      imgSrcURL = imgURLInfo.toString()
    }
  }
  const postData: ImageApiRequest = {
    bookName: apiEndpointInfo.projectName,
    progress: imgProgress,
    url: isDataURL ? '<data URL>' : imgSrcURL,
    imageType: isDataURL ? ImageType.DataURL : ImageType.Common
  }
  if (!isDataURL) {
    //判断是否已经抓取过了
    const fetchInfo: FetchedImageInfo | undefined = imageFetchList.find((item) => item.url === imgSrcURL)
    //match到缓存
    if (fetchInfo !== undefined) {
      postData.imageType = ImageType.Exists
      imgElement.src = fetchInfo.data
    }
  }
  //抓取图片的最大尝试次数
  const maxTryCount = 4
  let fetchErr: Error | null = null
  const logPrefix = '[' + postData.progress + ']fetch ' + postData.url
  if (postData.imageType === ImageType.Common) {
    console.log(logPrefix + ' .....')
  }
  let tryCount = 1
  while (tryCount <= maxTryCount) {
    try {
      await processFetchImage(apiEndpointInfo, postData, imgElement, imageFetchList)
      break
    } catch (ex) {
      if (tryCount === maxTryCount) {
        fetchErr = ex as Error
        break
      } else {
        console.error(logPrefix + ' failed(#try' + tryCount + '): ' + (ex as Error).message)
        tryCount++
      }
    }
  }
  if (fetchErr !== null) {
    console.error(logPrefix + ' failed(#try' + tryCount + '): ' + fetchErr.message)
    return
  }
  if (postData.imageType === ImageType.Common) {
    let message = logPrefix + ' success'
    if (tryCount > 1) {
      message += '(#try' + tryCount + ')'
    }
    console.log(message)
  } else {
    console.log(logPrefix + ' skip')
  }
}
