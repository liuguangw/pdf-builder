import { PageInfo, ParsePageListResult, ReplaceURLHandler } from './common'
import { MenuInfo, ServerMenuInfo } from '../common/menu_info'

export default function parsePageList(
  menuList: MenuInfo[],
  deep: number,
  contextURL: string,
  replaceURLHandler: ReplaceURLHandler
): ParsePageListResult {
  const pageList: PageInfo[] = []
  const serverMenuList: ServerMenuInfo[] = []
  menuList.forEach((menuInfo) => {
    let childDeep: number = deep + 1
    const serverMenuInfo: ServerMenuInfo = {
      title: menuInfo.title,
      filename: '',
      children: []
    }
    const pageInfo: PageInfo = {
      title: menuInfo.title,
      url: menuInfo.url,
      filename: '',
      deep: deep
    }
    if (menuInfo.url !== '' && menuInfo.url.startsWith(contextURL)) {
      //计算filename
      serverMenuInfo.filename = replaceURLHandler(menuInfo.url, contextURL)
      pageInfo.filename = serverMenuInfo.filename
      const hashPos = serverMenuInfo.filename.indexOf('#')
      if (hashPos > 0) {
        pageInfo.filename = pageInfo.filename.substring(0, hashPos)
      }
      pageList.push(pageInfo)
    } else {
      //无URL的不需要抓取,不在contextURL范围的不抓取
      childDeep = deep
    }
    if (menuInfo.children.length > 0) {
      const subResult = parsePageList(menuInfo.children, childDeep, contextURL, replaceURLHandler)
      subResult.pageList.forEach((itemInfo) => {
        pageList.push(itemInfo)
      })
      subResult.menuList.forEach((itemInfo) => {
        serverMenuInfo.children.push(itemInfo)
      })
    }
    serverMenuList.push(serverMenuInfo)
  })
  return {
    menuList: serverMenuList,
    pageList
  }
}
