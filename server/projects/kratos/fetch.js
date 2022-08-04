await (async function () {
    //项目定义
    const projectName = "kratos"
    const contextURL = "https://go-kratos.dev/docs/";
    //api定义
    const apiPrefix = " http://127.0.0.1:3000";
    const menuApiURL = apiPrefix + "/api/books/" + projectName + "/menu-info"
    const contentApiURL = apiPrefix + "/api/books/" + projectName + "/content"

    /**
     *
     * @param scriptURL
     * @return {Promise<unknown>}
     */
    function loadScript(scriptURL) {
        return new Promise((resolve, reject) => {
            let sc = document.createElement("script");
            sc.type = "text/javascript";
            sc.src = scriptURL;
            sc.addEventListener("load", resolve);
            sc.addEventListener("error", (e) => {
                reject(e)
            })
            document.body.appendChild(sc);
        });
    }

    /**
     * 暂停一段时间
     *
     * @param {number} ms
     * @return {Promise<void>}
     */
    function sleepAsync(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    /**
     * 替换url为一级文件名
     * @param {string} fullURL
     * @param {string} contextURL
     * @return {string}
     */
    function replaceURL(fullURL, contextURL) {
        if (fullURL === contextURL) {
            return "index.html"
        }
        let pos = fullURL.indexOf(contextURL)
        //外部url
        if (pos === -1) {
            return fullURL
        }
        //解析url
        let urlInfo = new URL(fullURL)
        //替换
        urlInfo.pathname = "/" + urlInfo.pathname.substring(1).replaceAll("/", "-")
        if (!urlInfo.pathname.endsWith(".html")) {
            urlInfo.pathname += ".html"
        }
        return decodeURI(urlInfo.toString().substring(contextURL.length))
    }

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
        let divElement = doc.querySelector("div.markdown");
        if (divElement === null) {
            divElement = doc.querySelector(".container>div");
            let navElement = divElement.querySelector("nav");
            let footerElement = divElement.querySelector("footer");
            divElement.removeChild(navElement);
            divElement.removeChild(footerElement);
        }
        //图片使用完整url
        {
            let imgList = divElement.querySelectorAll("img");
            for (let i = 0; i < imgList.length; i++) {
                let imgEl = imgList.item(i);
                imgEl.src = imgEl.src;
            }
        }
        //a标签链接替换
        {
            let aList = divElement.querySelectorAll("a");
            for (let i = 0; i < aList.length; i++) {
                let aEl = aList.item(i);
                aEl.href = replaceURL(aEl.href, contextURL)
            }
        }
        return divElement;
    }

    //加载脚本
    if (!("axios" in window)) {
        //加载js
        const axiosURL = "https://cdn.jsdelivr.net/npm/axios@0.27.2/dist/axios.min.js"
        try {
            await loadScript(axiosURL);
        } catch (e) {
            console.error(e);
            return;
        }
    }
    //获取menu list
    let menuList = [];
    let allPageList = [];

    function parseMenuList(liElementList, targetList) {
        for (let itemIndex = 0; itemIndex < liElementList.length; itemIndex++) {
            let liElement = liElementList.item(itemIndex);
            /**
             *
             * @type {HTMLAnchorElement}
             */
            let menuLink = liElement.querySelector("a.menu__link");
            let subMenuUlEl = liElement.querySelector("ul.menu__list");
            let menuItem = {
                title: menuLink.innerText,
                filename: replaceURL(menuLink.href, contextURL),
                children: []
            }
            allPageList.push({
                title: menuLink.innerText,
                filename: replaceURL(menuLink.href, contextURL),
                url: menuLink.href, contextURL,
            });
            if (subMenuUlEl !== null) {
                parseMenuList(subMenuUlEl.children, menuItem.children);
            }
            targetList.push(menuItem);
        }
    }

    let menuRootEl = document.querySelector(".theme-doc-sidebar-menu.menu__list");
    parseMenuList(menuRootEl.children, menuList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    try {
        let saveMenuResponse = await window.axios.post(menuApiURL, menuList)
        if (saveMenuResponse.data.code !== 0) {
            console.error(saveMenuResponse.data.message)
        } else {
            console.log("save menu success")
        }
    } catch (e) {
        console.error(e)
    }
    //console.log(allPageList)
    for (let pageIndex = 0; pageIndex < allPageList.length; pageIndex++) {
        let pageInfo = allPageList[pageIndex];
        let pageHtml = "";
        if (pageIndex > 0) {
            await sleepAsync(2500);
        }
        try {
            let contentEl = await fetchPage(pageInfo.url);
            pageHtml = contentEl.outerHTML;
        } catch (e) {
            console.error("fetch " + pageInfo.url + " failed: " + e.message);
            continue;
        }
        let postData = {
            title: pageInfo.title,
            filename: pageInfo.filename,
            content: pageHtml
        }
        let tagText = "[" + (pageIndex + 1) + "/" + allPageList.length + "]save [" + postData.title + " - " + postData.filename + "]";
        try {
            let saveContentResponse = await window.axios.post(contentApiURL, postData)
            if (saveContentResponse.data.code !== 0) {
                console.error(tagText + " failed: " + saveContentResponse.data.message)
            } else {
                console.log(tagText + " success")
            }
        } catch (e) {
            console.error(tagText + " failed: " + e.message)
        }
    }
})();
