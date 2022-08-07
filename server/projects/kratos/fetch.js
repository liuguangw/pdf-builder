import replaceURL from "../../fetch_lib/replace_url.js";
import apiEndpoint from "../../fetch_lib/api_endpoint.js";
import fetchAndSave from "../../fetch_lib/fetch_and_save.js";
import loadAxios from "../../fetch_lib/load_axios.js";

//项目定义
const contextURL = "https://go-kratos.dev/docs/";
//api定义
const apiEndpointInfo = apiEndpoint("kratos");
//抓取页面的间隔时间(ms)
const sleepDuration = 2300

/**
 * 抓取页面
 *
 * @param {string} pageURL
 * @return {Promise<HTMLDivElement>}
 */
async function fetchPage(pageURL) {
    let fetchPageResponse = await window.axios.get(pageURL, {
        responseType: "document"
    });
    let doc = fetchPageResponse.data;
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
            parseMenuList(subMenuUlEl.children, menuItem.children, allPageList);
        }
        menuList.push(menuItem);
    })
}

(async () => {
    //加载脚本
    try {
        await loadAxios();
    } catch (e) {
        console.error(e);
        return;
    }
    //获取menu list
    let menuList = [];
    let allPageList = [];
    let menuRootEl = document.querySelector(".theme-doc-sidebar-menu.menu__list");
    parseMenuList(menuRootEl.children, menuList, allPageList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    //console.log(allPageList)
    await fetchAndSave(menuList, allPageList, apiEndpointInfo, sleepDuration, contextURL, fetchPage);
})().then(() => {
})
