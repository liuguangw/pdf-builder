import {MenuInfo, PageInfo} from "./common";

export default function parsePageList(menuList: MenuInfo[], deep: number): PageInfo[] {
    let pageList: PageInfo[] = []
    menuList.forEach(menuInfo => {
        let childDeep: number = deep + 1
        if (menuInfo.filename !== "") {
            let pageInfo: PageInfo = {
                title: menuInfo.title,
                url: menuInfo.url,
                filename: menuInfo.filename,
                deep: deep
            }
            pageList.push(pageInfo)
        } else {
            childDeep = deep
        }
        if (menuInfo.children.length > 0) {
            let childPageList: PageInfo[] = parsePageList(menuInfo.children, childDeep)
            childPageList.forEach(pageInfo => {
                pageList.push(pageInfo)
            })
        }
    })
    return pageList
}
