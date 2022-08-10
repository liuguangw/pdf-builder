import replaceURL from "../../fetch_lib/replace_url";
import fetchAndSave from "../../fetch_lib/fetch_and_save";
import fetchPageDocument from "../../fetch_lib/fetch_page_document";

//项目定义
let projectName = "laravel";
const contextURL = "https://learnku.com/docs/laravel/9.x/";
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
    let contentEl = doc.querySelector("div.content-body");
    //fix 锚点问题
    contentEl.querySelectorAll("a").forEach(linkElement => {
        let nameValue = linkElement.getAttribute("name")
        if (nameValue !== null) {
            linkElement.setAttribute("id", nameValue)
            linkElement.removeAttribute("name")
        }
    })
    return contentEl;
}

/**
 * 用于laravel文档的url替换算法
 *
 * @param {string} fullURL
 * @param {string} contextURL
 * @return string
 */
function myReplaceURL(fullURL, contextURL) {
    //将url和hash分开
    let itemURL = fullURL;
    let itemHash = "";
    let pos = itemURL.indexOf("#")
    if (pos !== -1) {
        itemHash = itemURL.substring(pos)
        itemURL = itemURL.substring(0, pos)
    }
    //去除尾部的 /+数字
    itemURL = itemURL.replace(/\/\d+$/, "")
    return replaceURL(itemURL + itemHash, contextURL)
}

function parseMenuList(groupNodeList, menuList) {
    groupNodeList.forEach(groupElement => {
        let groupIconElement = groupElement.querySelector("i");
        let groupTitle = groupIconElement.nextSibling.textContent.trim();
        let subMenuNodeList = groupElement.querySelectorAll("ol>li.item>a");
        let menuItem = {
            title: groupTitle,
            url: "",
            children: []
        }
        subMenuNodeList.forEach(subMenuEl => {
            let subMenuChildNodes = subMenuEl.childNodes;
            let subMenuItem = {
                title: subMenuChildNodes.item(0).textContent.trim(),
                url: subMenuEl.href,
                children: []
            };
            menuItem.children.push(subMenuItem);
        })
        menuList.push(menuItem);
    })
}

(async () => {
    //获取menu list
    let menuList = [];
    let groupNodeList = document.querySelectorAll("ol.sorted_table>li.item");
    parseMenuList(groupNodeList, menuList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList,null,"\t"))
    await fetchAndSave(menuList, projectName, sleepDuration, contextURL, fetchPage, myReplaceURL);
})();
