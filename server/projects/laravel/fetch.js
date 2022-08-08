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
    return doc.querySelector("div.content-body");
}

function parseMenuList(groupNodeList, menuList, allPageList) {
    groupNodeList.forEach(groupElement => {
        let groupIconElement = groupElement.querySelector("i");
        let groupTitle = groupIconElement.nextSibling.textContent.trim();
        let subMenuNodeList = groupElement.querySelectorAll("ol>li.item>a");
        let menuItem = {
            title: groupTitle,
            filename: "",
            children: []
        }
        subMenuNodeList.forEach(subMenuEl => {
            let subMenuChildNodes = subMenuEl.childNodes;
            let subMenuItem = {
                title: subMenuChildNodes.item(0).textContent.trim(),
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
    let groupNodeList = document.querySelectorAll("ol.sorted_table>li.item");
    parseMenuList(groupNodeList, menuList, allPageList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    //console.log(allPageList)
    await fetchAndSave(menuList, allPageList, projectName, sleepDuration, contextURL, fetchPage);
})();
