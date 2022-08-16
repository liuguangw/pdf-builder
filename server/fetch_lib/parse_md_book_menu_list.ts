import { MenuInfo } from '../common/menu_info'

/**
 * mdBook专用菜单解析
 * @param liElementList
 * @param menuList
 */
export function parseMdBookMenuList(liElementList: NodeListOf<Element> | Element[], menuList: MenuInfo[]) {
  liElementList.forEach((liElement: Element) => {
    const menuLink: HTMLAnchorElement = liElement.querySelector('a')
    const menuItem: MenuInfo = {
      title: menuLink.innerText,
      url: menuLink.href,
      children: []
    }
    const nextElement = liElement.nextElementSibling
    if (nextElement !== null) {
      const subOlElement: HTMLOListElement = nextElement.querySelector('ol')
      if (subOlElement !== null) {
        const subElementList: Element[] = Array.from(subOlElement.children)
        parseMdBookMenuList(subElementList, menuItem.children)
      }
    }
    menuList.push(menuItem)
  })
}
