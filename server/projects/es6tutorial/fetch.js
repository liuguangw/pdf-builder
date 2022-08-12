import fetchAndSave from "../../fetch_lib/fetch_and_save";
import fetchPageContent from "../../fetch_lib/fetch_page_content";
import {parseAsDocument} from "../../fetch_lib/fetch_page_document.js";

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
    let doc = parseAsDocument(`<div id="content">${contentHtml}</div>`)
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
    //h3 id fix: 禁止id重复
    let idList = []
    doc.querySelectorAll("h3").forEach(h3Element => {
        let h3id = h3Element.getAttribute("id")
        if (h3id !== null) {
            if (idList.includes(h3id)) {
                h3Element.removeAttribute("id")
            } else {
                idList.push(h3id)
            }
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
    await fetchAndSave(menuList, sleepDuration, fetchPage);
})();
