import fetchAndSave from "../../fetch_lib/fetch_and_save";
import fetchPageContent from "../../fetch_lib/fetch_page_content";

//项目定义
let projectName = "es6tutorial";
const contextURL = "https://es6.ruanyifeng.com/";
//抓取页面的间隔时间(ms)
const sleepDuration = 2300;

/**
 * 抓取页面
 *
 * @param {string} pageURL
 * @return {Promise<HTMLDivElement>}
 */
async function fetchPage(pageURL) {
    let markdownContent = await fetchPageContent(pageURL)
    let contentHtml = window.marked(markdownContent)
    contentHtml = "<div id=\"content\">" + contentHtml + "</div>"
    const parser = new DOMParser();
    let doc = parser.parseFromString(contentHtml, "text/html")
    //代码高亮
    doc.querySelectorAll("pre code").forEach(codeElement => {
        window.Prism.highlightElement(codeElement)
    });
    return doc.querySelector("div#content");
}

function parseMenuList(menuNodeList, menuList, allPageList) {
    menuNodeList.forEach(menuElement => {
        let linkElement = menuElement.querySelector("a");
        let menuItem = {
            title: linkElement.innerText,
            filename: linkElement.hash.substring(1).replaceAll("/", "-") + ".html",
            children: []
        }
        menuList.push(menuItem);
        allPageList.push({
            title: menuItem.title,
            filename: menuItem.filename,
            url: contextURL + linkElement.hash.substring(1) + ".md"
        });
    })
}

(async () => {
    //获取menu list
    let menuList = [];
    let allPageList = [];
    let menuNodeList = document.querySelectorAll("#sidebar>ol>li");
    parseMenuList(menuNodeList, menuList, allPageList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    //console.log(allPageList)
    await fetchAndSave(menuList, allPageList, projectName, sleepDuration, contextURL, fetchPage);
})();
