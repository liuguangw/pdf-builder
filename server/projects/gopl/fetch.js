import fetchAndSave from "../../fetch_lib/fetch_and_save";
import fetchPageDocument from "../../fetch_lib/fetch_page_document";
import {parseMdBookMenuList} from "../../fetch_lib/parse_md_book_menu_list.js";

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
    //代码高亮
    docHighlight(doc);
    let contentEl = doc.querySelector("#content main");
    let indexPagePath = "/index.html"
    if (pageURL.endsWith(indexPagePath)) {
        //防止在线阅读的链接被替换
        contentEl.querySelectorAll("a").forEach(linkElement => {
            if (linkElement.innerText === "https://gopl-zh.github.io") {
                //标记为非pdf内部链接
                linkElement.classList.add("pdf-no-inner-link")
            }
        })
    }
    //需要被删除的元素
    let toDelNodes = []
    let pageUrlInfo = new URL(pageURL)
    if (pageUrlInfo.pathname !== indexPagePath) {
        let ulElement = contentEl.querySelector("ul")
        toDelNodes.push(ulElement)
        toDelNodes.push(ulElement.nextElementSibling)//hr tag
    }
    //去掉底部非文档内容
    let gContainer = doc.getElementById("giscus-container")
    toDelNodes.push(gContainer)
    toDelNodes.push(gContainer.nextElementSibling)//footer tag
    let adTable = gContainer.previousElementSibling;
    toDelNodes.push(adTable)//table
    toDelNodes.push(adTable.previousElementSibling)//hr tag
    toDelNodes.forEach(nodeEl => {
        nodeEl.parentElement.removeChild(nodeEl)
    })
    return contentEl;
}

function docHighlight(doc) {
    // Syntax highlighting Configuration
    window.hljs.configure({
        tabReplace: '    ', // 4 spaces
        languages: [],      // Languages used for auto-detection
    });
    let code_nodes = Array
        .from(doc.querySelectorAll('code'))
        // Don't highlight `inline code` blocks in headers.
        .filter(nodeEl => !nodeEl.parentElement.classList.contains("header"));
    code_nodes.forEach((block) => {
        block.classList.add('hljs');
        window.hljs.highlightBlock(block);
    });
}

(async () => {
    //获取menu list
    let menuList = [];
    let liElementList = document.querySelectorAll("ol.chapter>li.chapter-item");
    parseMdBookMenuList(liElementList, menuList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList,null,"\t"))
    await fetchAndSave(menuList, sleepDuration, fetchPage);
})();
