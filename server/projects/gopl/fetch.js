import fetchAndSave from "../../fetch_lib/fetch_and_save";
import fetchPageDocument from "../../fetch_lib/fetch_page_document";

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
    //除了首页的二维码都删掉
    if (!pageURL.endsWith("/index.html")) {
        let giscusContainer = doc.getElementById("giscus-container")
        let adTable = giscusContainer.previousElementSibling;
        adTable.parentElement.removeChild(adTable)
    }
    return contentEl;
}

function parseMenuList(liElementList, menuList) {
    liElementList.forEach(liElement => {
        /**
         *
         * @type {HTMLAnchorElement}
         */
        let menuLink = liElement.querySelector("a");
        let menuItem = {
            title: menuLink.innerText,
            url: menuLink.href,
            children: []
        }
        let nextElement = liElement.nextElementSibling;
        if (nextElement !== null) {
            let subOlElement = nextElement.querySelector("ol");
            if (subOlElement !== null) {
                parseMenuList(Array.from(subOlElement.children), menuItem.children)
            }
        }
        menuList.push(menuItem);
    })
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
    parseMenuList(liElementList, menuList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList,null,"\t"))
    await fetchAndSave(menuList, sleepDuration, fetchPage);
})();
