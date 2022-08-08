import fetchAndSave from "../../fetch_lib/fetch_and_save";
import replaceURL from "../../fetch_lib/replace_url";
import fetchPageDocument from "../../fetch_lib/fetch_page_document";

//项目定义
let projectName = "vite";
const contextURL = "https://cn.vitejs.dev/";
//抓取页面的间隔时间(ms)
const sleepDuration = 2300;

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
    let divElement = doc.querySelector("main>div>div");
    //删除header-anchor
    let aNodeList = divElement.querySelectorAll("a.header-anchor")
    aNodeList.forEach(aEl => {
        aEl.parentElement.removeChild(aEl);
    })
    return divElement;
}

function parseMenuList(groupList, menuList, allPageList) {
    groupList.forEach(groupElement => {
        /**
         *
         * @type {HTMLElement}
         */
        let groupTitleElement = groupElement.querySelector(".title>h2.title-text");
        let subMenuNodeList = groupElement.querySelectorAll(".items>a");
        let menuItem = {
            title: groupTitleElement.innerText,
            filename: "",
            children: []
        }
        subMenuNodeList.forEach(subMenuEl => {
            let subMenuItem = {
                title: subMenuEl.innerText,
                filename: replaceURL(subMenuEl.href, contextURL),
                children: []
            }
            allPageList.push({
                title: subMenuItem.title,
                filename: subMenuItem.filename,
                url: subMenuEl.href
            });
            menuItem.children.push(subMenuItem);
        })
        menuList.push(menuItem);
    })
}

(async () => {
    //获取menu list
    let menuList = [];
    let allPageList = [];

    let groupList = [];
    let groupNodeList = document.querySelectorAll("nav>div.group");
    for (let i = 0; i < groupNodeList.length; i++) {
        groupList.push(groupNodeList.item(i));
    }
    //配置文档
    let configDoc = await fetchPageDocument(contextURL + "config/")
    groupList.push(configDoc.querySelector("nav>div.group"));
    parseMenuList(groupList, menuList, allPageList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    //console.log(allPageList)
    await fetchAndSave(menuList, allPageList, projectName, sleepDuration, contextURL, fetchPage);
})();
