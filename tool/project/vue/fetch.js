(function () {
    var baseUrl = "https://cn.vuejs.org/v2/guide/";

    function clientInit(socket) {
        var itemList = document.querySelectorAll(".menu-root>li>h3,.menu-root>li>a");
        /*初始化菜单组*/
        var menuGroups = [];
        var pageStructLoaded = "pageData" in window;
        if (!pageStructLoaded) {
            /*初始化要抓取的网页结构*/
            window.pageData = [];
        }
        var urlNodes = [];
        for (var i = 0; i < itemList.length; i++) {

            (function (itemElement) {

                if (itemElement.tagName === "H3") {
                    menuGroups.push({
                        title: itemElement.innerText,
                        list: []
                    });
                } else {
                    var menuItemInfo = {
                        title: itemElement.innerText,
                        url: itemElement.href.substr(baseUrl.length)
                    };
                    menuGroups[menuGroups.length - 1].list.push(menuItemInfo);
                    urlNodes.push(menuItemInfo);
                    if (!pageStructLoaded) {
                        window.pageData.push({
                            url: menuItemInfo.url,
                            title: menuItemInfo.title,
                            fetched: false,
                            content: ""
                        });
                    }
                }

            })(itemList.item(i));
        }
        /*保存菜单信息*/
        //console.log(menuGroups);
        pageStructLoaded = true;
        socket.emit("app save_menu_info", menuGroups);
        /*传递URL链接给后端*/
        socket.emit("app save_urls", urlNodes);
        /*开始抓取网页*/
        setTimeout(function () {
            fetchPage(0);
        }, 200);
    }

    function fetchPage(pageIndex) {
        if (pageIndex < window.pageData.length) {
            /*已经抓取过了的,不再重复抓取*/
            if (window.pageData[pageIndex].fetched) {
                console.log("[" + (pageIndex + 1) + "/" + window.pageData.length + "]use cache - " + window.pageData[pageIndex].url);
                savePage(window.pageData[pageIndex].url, window.pageData[pageIndex].title, window.pageData[pageIndex].content);
                fetchPage(pageIndex + 1);
            } else {
                console.log("[" + (pageIndex + 1) + "/" + window.pageData.length + "]fetch - " + window.pageData[pageIndex].url);
                window.axios.get(baseUrl + window.pageData[pageIndex].url, {
                    responseType: "document"
                }).then(function (response) {
                    // handle success
                    let doc = response.data;
                    let aList = doc.querySelectorAll("a");
                    for (let aIndex = 0; aIndex < aList.length; aIndex++) {
                        let aElement = aList.item(aIndex);
                        if (aElement.href.indexOf(baseUrl)) {
                            //绝对路径转相对路径
                            aElement.href = aElement.href.substr(baseUrl.length);
                        }
                    }
                    //删除广告
                    let adElement = doc.getElementById("ad");
                    if (adElement !== null) {
                        adElement.parentNode.removeChild(adElement);
                    }
                    let adElements = doc.getElementsByClassName("ad-pagetop");
                    for (let adIndex = 0; adIndex < adElements.length; adIndex++) {
                        let tmpAdElement = adElements.item(adIndex);
                        tmpAdElement.parentNode.removeChild(tmpAdElement);
                    }
                    //删除底部script标签
                    let scriptList = doc.querySelectorAll(".footer script");
                    for (let scriptIndex = 0; scriptIndex < scriptList.length; scriptIndex++) {
                        let tmpScript = scriptList.item(scriptIndex);
                        tmpScript.parentNode.removeChild(tmpScript);
                    }
                    //图片链接
                    let docImgs = doc.getElementsByTagName("img");
                    for (let imgIndex = 0; imgIndex < docImgs.length; imgIndex++) {
                        let docImg = docImgs.item(imgIndex);
                        let docImgSrc = docImg.getAttribute("src");
                        if (docImgSrc.indexOf("/") === 0) {
                            docImg.setAttribute("src", location.origin + docImgSrc);
                        }
                    }
                    //代码高亮
                    doc.querySelectorAll('pre code').forEach((block) => {
                        window.hljs.highlightBlock(block);
                    });
                    //
                    window.pageData[pageIndex].content = doc.querySelector("#main>.content").outerHTML;
                    window.pageData[pageIndex].fetched = true;
                    //save
                    savePage(window.pageData[pageIndex].url, window.pageData[pageIndex].title, window.pageData[pageIndex].content);
                    fetchPage(pageIndex + 1);
                }).catch(function (error) {
                    console.error(error);
                });
            }
        }
    }

    function savePage(pageUrl, pageTitle, pageContent) {
        window.socket.emit("app save_page_info", {
            url: pageUrl,
            title: pageTitle,
            content: pageContent
        });
    }

    function loadScript(item, itemUrl, fn) {
        if (item in window) {
            fn();
        } else {
            var sc = document.createElement("script");
            sc.type = "text/javascript";
            sc.src = itemUrl;
            sc.addEventListener("load", fn);
            document.body.appendChild(sc);
        }
    }

    function loadItemList(itemList, fn) {
        if (itemList.length > 0) {
            loadScript(itemList[0].name, itemList[0].url, function () {
                loadItemList(itemList.slice(1), fn);
            });
        } else {
            fn();
        }
    }

    loadItemList([
        {name: "io", url: "//lib.baomitu.com/socket.io/2.2.0/socket.io.js"},
        {name: "axios", url: "//lib.baomitu.com/axios/0.18.0/axios.min.js"},
        {name: "highlight", url: "//lib.baomitu.com/highlight.js/9.15.6/highlight.min.js"}
    ], function () {
        if ("socket" in window) {
            // 第二次执行时无需再次连接websocket
            clientInit(window.socket);
        } else {
            window.socket = io("http://localhost:5006/fetch-api");
            window.socket.on('connect', function () {
                clientInit(window.socket);
            });
        }
    });
})();
