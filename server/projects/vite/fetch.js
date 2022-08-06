import apiEndpoint from "../../fetch_lib/api_endpoint.js";
import loadAxios from "../../fetch_lib/load_axios.js";
import fetchAndSave from "../../fetch_lib/fetch_and_save.js";
import replaceURL from "../../fetch_lib/replace_url.js";

(async function () {
    //项目定义
    const contextURL = "https://cn.vitejs.dev/";
    //api定义
    const apiEndpointInfo = apiEndpoint("vite");
    //抓取页面的间隔时间(ms)
    const sleepDuration = 2300;

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
        let divElement = doc.querySelector("main>div>div");
        //删除header-anchor
        {
            let aList = divElement.querySelectorAll("a.header-anchor");
            for (let i = 0; i < aList.length; i++) {
                /**
                 *
                 * @type {HTMLAnchorElement}
                 */
                let aEl = aList.item(i);
                aEl.parentElement.removeChild(aEl);
            }
        }
        return divElement;
    }

    function parseMenuList(groupList, menuList, allPageList) {
        for (let itemIndex = 0; itemIndex < groupList.length; itemIndex++) {
            let groupElement = groupList[itemIndex];
            /**
             *
             * @type {HTMLElement}
             */
            let groupTitleElement = groupElement.querySelector(".title>h2.title-text");
            let subMenuElementList = groupElement.querySelectorAll(".items>a");
            let menuItem = {
                title: groupTitleElement.innerText,
                filename: "",
                children: []
            }
            for (let i = 0; i < subMenuElementList.length; i++) {
                /**
                 *
                 * @type {HTMLAnchorElement}
                 */
                let subMenuEl = subMenuElementList.item(i);
                let subMenuItem = {
                    title: subMenuEl.innerText,
                    filename: replaceURL(subMenuEl.href, contextURL),
                    children: []
                }
                allPageList.push({
                    title: subMenuEl.innerText,
                    filename: replaceURL(subMenuEl.href, contextURL),
                    url: subMenuEl.href
                });
                menuItem.children.push(subMenuItem);
            }
            menuList.push(menuItem);
        }
    }

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

    let groupList = [];
    let groupNodeList = document.querySelectorAll("nav>div.group");
    for (let i = 0; i < groupNodeList.length; i++) {
        groupList.push(groupNodeList.item(i));
    }
    //配置文档
    let fetchPageResponse = await window.axios.get(contextURL + "config/", {
        responseType: "document"
    });
    let configDoc = fetchPageResponse.data;
    groupList.push(configDoc.querySelector("nav>div.group"));
    parseMenuList(groupList, menuList, allPageList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    //console.log(allPageList)
    await fetchAndSave(menuList, allPageList, apiEndpointInfo, sleepDuration, contextURL, fetchPage);
})().then(() => {

});
