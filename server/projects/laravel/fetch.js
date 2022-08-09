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

function parseMenuList(groupNodeList, menuList) {
    groupNodeList.forEach(groupElement => {
        let groupIconElement = groupElement.querySelector("i");
        let groupTitle = groupIconElement.nextSibling.textContent.trim();
        let subMenuNodeList = groupElement.querySelectorAll("ol>li.item>a");
        let menuItem = {
            title: groupTitle,
            url: "",
            filename: "",
            children: []
        }
        subMenuNodeList.forEach(subMenuEl => {
            let subMenuChildNodes = subMenuEl.childNodes;
            let subMenuItem = {
                title: subMenuChildNodes.item(0).textContent.trim(),
                url: subMenuEl.href,
                filename: replaceURL(subMenuEl.href, contextURL),
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
    await fetchAndSave(menuList, projectName, sleepDuration, contextURL, fetchPage);
})();
