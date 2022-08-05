await (async function () {
    //项目定义
    const projectName = "rustbook"
    const contextURL = "https://kaisery.github.io/trpl-zh-cn/";
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
        //代码高亮
        docHighlight(doc);
        //有问题的代码图标
        processFerrises(doc);
        /**
         *
         * @type {HTMLDivElement}
         */
        let divElement = doc.querySelector("#content main");
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
    if (!("hljs" in window)) {
        //加载js
        const hljsURL = contextURL + +"highlight.js";
        try {
            await loadScript(hljsURL);
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
            let menuLink = liElement.querySelector("a");
            let nextLi = liElement.nextElementSibling;
            let subMenuUlEl = null;
            if (nextLi !== null) {
                subMenuUlEl = nextLi.querySelector("ol.section");
            }
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

    function docHighlight(doc) {
        let hljs = window.hljs;
        let hiding_character = "#";
        // Syntax highlighting Configuration
        hljs.configure({
            tabReplace: '    ', // 4 spaces
            languages: [],      // Languages used for auto-detection
        });
        Array
            .from(doc.querySelectorAll('code'))
            .forEach(function (block) {
                hljs.highlightBlock(block);
            });
        // Adding the hljs class gives code blocks the color css
        // even if highlighting doesn't apply
        Array
            .from(doc.querySelectorAll('code'))
            .forEach(function (block) {
                block.classList.add('hljs');
            });

        Array.from(doc.querySelectorAll("code.language-rust")).forEach(function (block) {

            let lines = Array.from(block.querySelectorAll('.boring'));
            // If no lines were hidden, return
            if (!lines.length) {
                return;
            }
            block.classList.add("hide-boring");

            let buttons = doc.createElement('div');
            buttons.className = 'buttons';
            buttons.innerHTML = "<button class=\"fa fa-expand\" title=\"Show hidden lines\" aria-label=\"Show hidden lines\"></button>";

            // add expand button
            let pre_block = block.parentNode;
            pre_block.insertBefore(buttons, pre_block.firstChild);
        });

        Array.from(doc.querySelectorAll('pre code')).forEach(function (block) {
            let pre_block = block.parentNode;
            if (!pre_block.classList.contains('playpen')) {
                let buttons = pre_block.querySelector(".buttons");
                if (!buttons) {
                    buttons = doc.createElement('div');
                    buttons.className = 'buttons';
                    pre_block.insertBefore(buttons, pre_block.firstChild);
                }

                let clipButton = doc.createElement('button');
                clipButton.className = 'fa fa-copy clip-button';
                clipButton.title = 'Copy to clipboard';
                clipButton.setAttribute('aria-label', clipButton.title);
                clipButton.innerHTML = '<i class=\"tooltiptext\"></i>';

                buttons.insertBefore(clipButton, buttons.firstChild);
            }
        });

        // Process playpen code blocks
        Array.from(doc.querySelectorAll(".playpen")).forEach(function (pre_block) {
            // Add play button
            let buttons = pre_block.querySelector(".buttons");
            if (!buttons) {
                buttons = doc.createElement('div');
                buttons.className = 'buttons';
                pre_block.insertBefore(buttons, pre_block.firstChild);
            }

            let runCodeButton = doc.createElement('button');
            runCodeButton.className = 'fa fa-play play-button';
            runCodeButton.hidden = true;
            runCodeButton.title = 'Run this code';
            runCodeButton.setAttribute('aria-label', runCodeButton.title);

            let copyCodeClipboardButton = doc.createElement('button');
            copyCodeClipboardButton.className = 'fa fa-copy clip-button';
            copyCodeClipboardButton.innerHTML = '<i class="tooltiptext"></i>';
            copyCodeClipboardButton.title = 'Copy to clipboard';
            copyCodeClipboardButton.setAttribute('aria-label', copyCodeClipboardButton.title);

            buttons.insertBefore(runCodeButton, buttons.firstChild);
            buttons.insertBefore(copyCodeClipboardButton, buttons.firstChild);

            let code_block = pre_block.querySelector("code");
            if (window.ace && code_block.classList.contains("editable")) {
                let undoChangesButton = doc.createElement('button');
                undoChangesButton.className = 'fa fa-history reset-button';
                undoChangesButton.title = 'Undo changes';
                undoChangesButton.setAttribute('aria-label', undoChangesButton.title);

                buttons.insertBefore(undoChangesButton, buttons.firstChild);
            }
        });
    }

    function processFerrises(doc) {
        let ferrisTypes = [
            {
                attr: 'does_not_compile',
                title: '这些代码不能编译！'
            },
            {
                attr: 'panics',
                title: '这些代码会 panic！'
            },
            {
                attr: 'unsafe',
                title: '这些代码块包含不安全（unsafe）代码。'
            },
            {
                attr: 'not_desired_behavior',
                title: '这些代码不会产生期望的行为。'
            }
        ];
        for (let ferrisType of ferrisTypes) {
            let elements = doc.getElementsByClassName(ferrisType.attr);
            for (let codeBlock of elements) {
                let lines = codeBlock.textContent.split(/\r|\r\n|\n/).length - 1;
                //大于4行则添加小图标
                if (lines >= 4) {
                    let a = doc.createElement('a');
                    a.setAttribute('href', 'ch00-00-introduction.html#ferris');
                    a.setAttribute('target', '_blank');

                    let img = doc.createElement('img');
                    img.setAttribute('src', 'img/ferris/' + ferrisType.attr + '.svg');
                    img.setAttribute('title', ferrisType.title);
                    img.className = 'ferris';

                    a.appendChild(img);
                    codeBlock.parentElement.insertBefore(a, codeBlock);
                }
            }
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

    let menuRootEl = document.querySelector("ol.chapter");
    parseMenuList(menuRootEl.children, menuList);
    //console.log(menuList)
    //console.log(JSON.stringify(menuList))
    await fetchAndSave(menuList, allPageList);
})();
