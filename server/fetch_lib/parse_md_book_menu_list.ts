import {MenuInfo} from "./common";

//mdBook专用菜单解析
export function parseMdBookMenuList(liElementList: NodeListOf<Element> | Element[], menuList: MenuInfo[]) {
    liElementList.forEach((liElement: Element) => {
        let menuLink: HTMLAnchorElement = liElement.querySelector("a");
        let menuItem: MenuInfo = {
            title: menuLink.innerText,
            url: menuLink.href,
            children: []
        }
        let nextElement = liElement.nextElementSibling;
        if (nextElement !== null) {
            let subOlElement: HTMLOListElement = nextElement.querySelector("ol");
            if (subOlElement !== null) {
                let subElementList: Element[] = Array.from(subOlElement.children);
                parseMdBookMenuList(subElementList, menuItem.children)
            }
        }
        menuList.push(menuItem);
    })
}
