import replaceURL from "../../fetch_lib/replace_url";
import fetchAndSave from "../../fetch_lib/fetch_and_save";
import fetchPageDocument from "../../fetch_lib/fetch_page_document";

//项目定义
let projectName = "kratos";
const contextURL = "https://go-kratos.dev/docs/";
//抓取页面的间隔时间(ms)
const sleepDuration = 2300

/**
 * 抓取页面
 *
 * @param {string} pageURL
 * @return {Promise<HTMLDivElement>}
 */
async function fetchPage(pageURL) {
    let doc = await fetchPageDocument(pageURL)
    /**
     *
     * @type {HTMLDivElement}
     */
    let divElement = doc.querySelector("div.markdown");
    if (divElement === null) {
        divElement = doc.querySelector(".container>div");
        let navElement = divElement.querySelector("nav");
        let footerElement = divElement.querySelector("footer");
        divElement.removeChild(navElement);
        divElement.removeChild(footerElement);
    }
    return divElement;
}

function parseMenuList(liElementList, menuList, allPageList) {
    liElementList.forEach(liElement => {
        /**
         *
         * @type {HTMLAnchorElement}
         */
        let menuLink = liElement.querySelector("a.menu__link");
        let subMenuUlEl = liElement.querySelector("ul.menu__list");
        let menuItem = {
            title: menuLink.innerText,
            filename: replaceURL(menuLink.href, contextURL),
            children: []
        }
        allPageList.push({
            title: menuItem.title,
            filename: menuItem.filename,
            url: menuLink.href,
        });
        if (subMenuUlEl !== null) {
            parseMenuList(Array.from(subMenuUlEl.children), menuItem.children, allPageList);
        }
        menuList.push(menuItem);
    })
}

(async () => {
    //获取menu list
    let menuList = [];
    let allPageList = [];
    let menuRootEl = document.querySelector(".theme-doc-sidebar-menu.menu__list");
    parseMenuList(Array.from(menuRootEl.children), menuList, allPageList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    //console.log(allPageList)
    await fetchAndSave(menuList, allPageList, projectName, sleepDuration, contextURL, fetchPage);
})();
