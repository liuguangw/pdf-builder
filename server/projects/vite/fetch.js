await (async function () {
    //项目定义
    const projectName = "vite"
    const contextURL = "https://cn.vitejs.dev/";
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
        let divElement = doc.querySelector("main>div>div");
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
        //删除header-anchor
        {
            let aList = divElement.querySelectorAll("a.header-anchor");
            for (let i = 0; i < aList.length; i++) {
                /**
                 *
                 * @type {HTMLAnchorElement}
                 */
                let aEl = aList.item(i);
                aEl.parentElement.removeChild(aEl);
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

    function parseMenuList(groupList, targetList) {
        for (let itemIndex = 0; itemIndex < groupList.length; itemIndex++) {
            let groupElement = groupList[itemIndex];
            /**
             *
             * @type {HTMLElement}
             */
            let groupTitleElement = groupElement.querySelector(".title>h2.title-text");
            let subMenuElementList = groupElement.querySelectorAll(".items>a");
            let menuItem = {
                title: groupTitleElement.innerText,
                filename: "",
                children: []
            }
            for (let i = 0; i < subMenuElementList.length; i++) {
                /**
                 *
                 * @type {HTMLAnchorElement}
                 */
                let subMenuEl = subMenuElementList.item(i);
                let subMenuItem = {
                    title: subMenuEl.innerText,
                    filename: replaceURL(subMenuEl.href, contextURL),
                    children: []
                }
                allPageList.push({
                    title: subMenuEl.innerText,
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

    let groupList = [];
    let groupNodeList = document.querySelectorAll("nav>div.group");
    for (let i = 0; i < groupNodeList.length; i++) {
        groupList.push(groupNodeList.item(i));
    }
    //配置文档
    let fetchPageResponse = await window.axios.get(contextURL + "config/", {
        responseType: "document"
    });
    let configDoc = fetchPageResponse.data;
    groupList.push(configDoc.querySelector("nav>div.group"));
    parseMenuList(groupList, menuList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    //console.log(allPageList)
    await fetchAndSave(menuList, allPageList);
})();
