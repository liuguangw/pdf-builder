import sleepAsync from './sleep_async'
import { processPageImages, processPageLinks, processPageToc } from './process_page'
import requestAPI from './request_api.js'
import { FetchedImageInfo, FetchPageHandler, ProjectInfo, ReplaceURLHandler } from './common'
import ApiEndpoint from './api_endpoint'
import parsePageList from './parse_page_list'
import replaceURL from './replace_url'
import { MenuInfo } from '../common/menu_info'
import { ContentApiRequest, FetchStatus, MenuApiRequest } from '../common/request'
import { ApiResponse } from '../common/response'

//抓取并保存网页
export default async function fetchAndSave(
  menuList: MenuInfo[],
  sleepDuration: number,
  fetchPage: FetchPageHandler,
  replaceURLHandler: ReplaceURLHandler = replaceURL
): Promise<void> {
  //@ts-expect-error: 这里会被替换
  const projectInfo: ProjectInfo = BOOK_PROJECT_INFO
  const projectName = projectInfo.projectName
  const contextURL = projectInfo.contextURL
  const apiEndpointInfo = new ApiEndpoint(projectName)
  //解析出allPageList(计算filename属性)
  const { menuList: serverMenuList, pageList: allPageList } = parsePageList(menuList, 1, contextURL, replaceURLHandler)
  //保存menu信息
  try {
    const menuInfoRequest: MenuApiRequest = {
      bookName: projectName,
      menuList: serverMenuList
    }
    const saveMenuResponse: ApiResponse<null> = await requestAPI(apiEndpointInfo.menuApiURL, menuInfoRequest)
    if (saveMenuResponse.code !== 0) {
      console.error(saveMenuResponse.message)
      return
    } else {
      console.log('save menu success')
    }
  } catch (e) {
    console.error(e)
    return
  }
  let hasFetchError = false
  const imageFetchList: FetchedImageInfo[] = []
  for (let pageIndex = 0; pageIndex < allPageList.length; pageIndex++) {
    const pageInfo = allPageList[pageIndex]
    if (pageIndex > 0) {
      await sleepAsync(sleepDuration)
    }
    const postData: ContentApiRequest = {
      bookName: projectName,
      title: pageInfo.title,
      filename: pageInfo.filename,
      content: '',
      progress: pageIndex + 1 + '/' + allPageList.length,
      status: FetchStatus.Ok,
      message: ''
    }
    //抓取页面
    let contentEl: HTMLElement | null = null
    //抓取页面的最大尝试次数
    const maxTryCount = 5
    let fetchErr: Error | null = null
    const logPrefix = '[' + postData.progress + ']fetch [' + pageInfo.title + ' - ' + pageInfo.filename + ']'
    let tryCount = 1
    while (tryCount <= maxTryCount) {
      try {
        contentEl = await fetchPage(pageInfo.url)
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
    if (fetchErr === null) {
      let message = logPrefix + ' success'
      if (tryCount > 1) {
        message += '(#try' + tryCount + ')'
      }
      console.log(message)
    } else {
      hasFetchError = true
      postData.status = FetchStatus.HasError
      postData.message = 'fetch ' + pageInfo.url + ' failed(#try' + tryCount + '): ' + fetchErr.message
      console.error(logPrefix + ' failed: ' + postData.message)
    }
    //处理
    if (contentEl !== null) {
      processPageLinks(contentEl, replaceURLHandler, pageInfo.url, contextURL)
      processPageToc(contentEl, pageInfo.deep)
      await processPageImages(contentEl, postData.progress, pageInfo.url, apiEndpointInfo, imageFetchList)
      postData.content = contentEl.outerHTML
    }
    //提交抓取结果给服务端
    try {
      await requestAPI(apiEndpointInfo.contentApiURL, postData)
    } catch (e) {
      hasFetchError = true
      console.error(e)
    }
  }
  //
  //console.log(imageFetchList)
  //通知服务端可以构建了
  if (!hasFetchError) {
    await requestAPI(apiEndpointInfo.notifyApiURL, {
      bookName: projectName
    })
  }
}
