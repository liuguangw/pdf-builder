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
    //图片链接fix
    doc.querySelectorAll("img").forEach(imgElement => {
        if (imgElement.parentElement.tagName.toLowerCase() === "a") {
            imgElement.parentElement.href = contextURL + "README"
        }
    });
    //h3 id fix
    doc.querySelectorAll("h3").forEach(h3Element => {
        if (h3Element.getAttribute("id") === "-") {
            h3Element.removeAttribute("id")
        }
    });
    return doc.querySelector("div#content");
}

function parseMenuList(menuNodeList, menuList) {
    menuNodeList.forEach(menuElement => {
        let linkElement = menuElement.querySelector("a");
        let hashText = linkElement.hash.substring(1)
        let menuItem = {
            title: linkElement.innerText,
            url: contextURL + hashText + ".md",
            filename: hashText.replaceAll("/", "-") + ".html",
            children: []
        }
        menuList.push(menuItem);
    })
}

(async () => {
    //获取menu list
    let menuList = [];
    let menuNodeList = document.querySelectorAll("#sidebar>ol>li");
    parseMenuList(menuNodeList, menuList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList,null,"\t"))
    await fetchAndSave(menuList, projectName, sleepDuration, contextURL, fetchPage);
})();
