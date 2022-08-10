import {MenuInfo, PageInfo, ReplaceURLHandler} from "./common";

export default function parsePageList(menuList: MenuInfo[], deep: number,
                                      contextURL: string, replaceURLHandler: ReplaceURLHandler): PageInfo[] {
    let pageList: PageInfo[] = []
    menuList.forEach(menuInfo => {
        let childDeep: number = deep + 1
        if (menuInfo.url !== "") {
            //计算filename
            menuInfo.filename = replaceURLHandler(menuInfo.url, contextURL)
            let pageInfo: PageInfo = {
                title: menuInfo.title,
                url: menuInfo.url,
                filename: menuInfo.filename,
                deep: deep
            }
            pageList.push(pageInfo)
        } else {
            menuInfo.filename = ""
            childDeep = deep
        }
        if (menuInfo.children.length > 0) {
            let childPageList: PageInfo[] = parsePageList(menuInfo.children, childDeep, contextURL, replaceURLHandler)
            childPageList.forEach(pageInfo => {
                pageList.push(pageInfo)
            })
        }
    })
    return pageList
}
