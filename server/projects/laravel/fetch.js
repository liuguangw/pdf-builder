import apiEndpoint from "../../fetch_lib/api_endpoint.js";
import replaceURL from "../../fetch_lib/replace_url.js";
import fetchAndSave from "../../fetch_lib/fetch_and_save.js";
import loadAxios from "../../fetch_lib/load_axios.js";

(async function () {
    //项目定义
    const contextURL = "https://learnku.com/docs/laravel/9.x/";
    //api定义
    const apiEndpointInfo = apiEndpoint("laravel");
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
        return doc.querySelector("div.content-body");
    }

    function parseMenuList(groupNodeList, menuList, allPageList) {
        for (let itemIndex = 0; itemIndex < groupNodeList.length; itemIndex++) {
            /**
             * @type {HTMLLIElement}
             */
            let groupElement = groupNodeList.item(itemIndex);
            let groupIconElement = groupElement.querySelector("i");
            let groupTitle = groupIconElement.nextSibling.textContent.trim();
            let subMenuNodeList = groupElement.querySelectorAll("ol>li.item>a");
            let menuItem = {
                title: groupTitle,
                filename: "",
                children: []
            }
            for (let i = 0; i < subMenuNodeList.length; i++) {
                /**
                 *
                 * @type {HTMLAnchorElement}
                 */
                let subMenuEl = subMenuNodeList.item(i);
                let subMenuChildNodes = subMenuEl.childNodes;
                let subMenuItem = {
                    title: subMenuChildNodes.item(0).textContent.trim(),
                    filename: replaceURL(subMenuEl.href, contextURL),
                    children: []
                }
                allPageList.push({
                    title: subMenuItem.title,
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
    let groupNodeList = document.querySelectorAll("ol.sorted_table>li.item");
    parseMenuList(groupNodeList, menuList, allPageList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    //console.log(allPageList)
    await fetchAndSave(menuList, allPageList, apiEndpointInfo, sleepDuration, contextURL, fetchPage);
})().then(() => {

})
