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
        //card页面
        divElement = doc.querySelector(".container>div");
        let navElement = divElement.querySelector("nav");
        let footerElement = divElement.querySelector("footer");
        divElement.removeChild(navElement);
        divElement.removeChild(footerElement);
        //h2替换,防止影响pdf目录结构
        let h2ElementList = divElement.querySelectorAll("h2")
        h2ElementList.forEach(h2Element => {
            h2Element.classList.add("pdf-no-toc")
        })
    }
    return divElement;
}

function parseMenuList(liElementList, menuList) {
    liElementList.forEach(liElement => {
        /**
         *
         * @type {HTMLAnchorElement}
         */
        let menuLink = liElement.querySelector("a.menu__link");
        let subMenuUlEl = liElement.querySelector("ul.menu__list");
        let menuItem = {
            title: menuLink.innerText,
            url: menuLink.href,
            filename: replaceURL(menuLink.href, contextURL),
            children: []
        }
        if (subMenuUlEl !== null) {
            parseMenuList(Array.from(subMenuUlEl.children), menuItem.children);
        }
        menuList.push(menuItem);
    })
}

(async () => {
    //获取menu list
    let menuList = [];
    let menuNodeList = document.querySelectorAll("nav>ul.menu__list>li");
    parseMenuList(menuNodeList, menuList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList,null,"\t"))
    await fetchAndSave(menuList, projectName, sleepDuration, contextURL, fetchPage);
})();
