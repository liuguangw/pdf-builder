await (async function () {
    //项目定义
    const projectName = "laravel"
    const contextURL = "https://learnku.com/docs/laravel/9.x/";
    //api定义
    const apiPrefix = " http://127.0.0.1:3000";
    const menuApiURL = apiPrefix + "/api/books/" + projectName + "/menu-info"
    const contentApiURL = apiPrefix + "/api/books/" + projectName + "/content"
    const notifyApiURL = apiPrefix + "/api/books/" + projectName + "/can-build"
    //抓取页面的间隔时间(ms)
    const sleepDuration = 2300

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
        let divElement = doc.querySelector("div.content-body");
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

    function parseMenuList(groupNodeList, targetList) {
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
            targetList.push(menuItem);
        }
    }

    async function fetchAndSave(menuList, allPageList) {
        try {
            let saveMenuResponse = await window.axios.post(menuApiURL, menuList)
            if (saveMenuResponse.data.code !== 0) {
                console.error(saveMenuResponse.data.message);
                return;
            } else {
                console.log("save menu success");
            }
        } catch (e) {
            console.error(e);
            return;
        }
        let hasFetchError = false;
        for (let pageIndex = 0; pageIndex < allPageList.length; pageIndex++) {
            let pageInfo = allPageList[pageIndex];
            if (pageIndex > 0) {
                await sleepAsync(sleepDuration);
            }
            let postData = {
                title: pageInfo.title,
                filename: pageInfo.filename,
                content: "",
                progress: (pageIndex + 1) + "/" + allPageList.length,
                status: 0,
                message: ""
            }
            try {
                let contentEl = await fetchPage(pageInfo.url);
                postData.content = contentEl.outerHTML;
                console.log("[" + postData.progress + "]fetch [" + pageInfo.title + " - " + pageInfo.filename + "] success");
            } catch (e) {
                hasFetchError = true;
                postData.status = 500;
                postData.message = "fetch " + pageInfo.url + " failed: " + e.message;
                console.error("[" + postData.progress + "]fetch [" + pageInfo.title + " - " + pageInfo.filename + "] failed: " + postData.message);
            }
            //提交抓取结果给服务端
            try {
                await window.axios.post(contentApiURL, postData)
            } catch (e) {
                hasFetchError = true;
                console.error(e)
            }
        }
        //通知服务端可以构建了
        if (!hasFetchError) {
            await window.axios.post(notifyApiURL)
        }
    }

    let groupNodeList = document.querySelectorAll("ol.sorted_table>li.item");
    parseMenuList(groupNodeList, menuList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    //console.log(allPageList)
    await fetchAndSave(menuList, allPageList);
})();
