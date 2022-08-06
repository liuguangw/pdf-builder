await (async function () {
    //项目定义
    const projectName = "kratos"
    const contextURL = "https://go-kratos.dev/docs/";
    //api定义
    const apiPrefix = " http://127.0.0.1:3000";
    const menuApiURL = apiPrefix + "/api/books/" + projectName + "/menu-info"
    const contentApiURL = apiPrefix + "/api/books/" + projectName + "/content"
    const imageApiURL = apiPrefix + "/api/books/" + projectName + "/images"
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
        let divElement = doc.querySelector("div.markdown");
        if (divElement === null) {
            divElement = doc.querySelector(".container>div");
            let navElement = divElement.querySelector("nav");
            let footerElement = divElement.querySelector("footer");
            divElement.removeChild(navElement);
            divElement.removeChild(footerElement);
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

    /**
     *
     * @param {HTMLDivElement} contentEl
     * @param {string} progress
     * @return {Promise<void>}
     */
    async function replaceContentImage(contentEl, progress) {
        let imageNodeList = contentEl.querySelectorAll("img")
        for (let imgIndex = 0; imgIndex < imageNodeList.length; imgIndex++) {
            let imgElement = imageNodeList.item(imgIndex)
            let imgSrcURL = imgElement.src
            let isDataURL = (imgSrcURL.substring(0, 5) === "data:")
            let postData = {
                "progress": progress + " img(" + (imgIndex + 1) + "/" + imageNodeList.length + ")",
                "url": isDataURL ? "<data URL>" : imgSrcURL
            }
            try {
                let saveMenuResponse = await window.axios.post(imageApiURL, postData)
                if (saveMenuResponse.data.code !== 0) {
                    console.error("[" + postData.progress + "]fetch " + postData.url + " failed: " + saveMenuResponse.data.message);
                    return;
                }
                console.log("[" + postData.progress + "]fetch " + postData.url + " success")
                if (!isDataURL) {
                    imgElement.src = saveMenuResponse.data.data
                }
            } catch (e) {
                console.error("[" + postData.progress + "]fetch " + postData.url + " failed: " + e.message)
            }
        }
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
                url: menuLink.href,
            });
            if (subMenuUlEl !== null) {
                parseMenuList(subMenuUlEl.children, menuItem.children);
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
                await replaceContentImage(contentEl, postData.progress);
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

    let menuRootEl = document.querySelector(".theme-doc-sidebar-menu.menu__list");
    parseMenuList(menuRootEl.children, menuList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    //console.log(allPageList)
    await fetchAndSave(menuList, allPageList);
})();
