(function () {
    var baseUrl = "https://webpack.docschina.org/concepts/";

    function clientInit(socket) {
        var itemList = document.querySelectorAll(".sidebar__inner>div>.sidebar-item>a");
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

                var menuItemInfo = {
                    title: itemElement.innerText,
                    url: itemElement.href.substr(baseUrl.length)
                };
                if (menuItemInfo.url.length === 0) {
                    menuItemInfo.url = "";
                }
                menuGroups.push(menuItemInfo);
                urlNodes.push(menuItemInfo);
                if (!pageStructLoaded) {
                    window.pageData.push({
                        url: menuItemInfo.url,
                        title: menuItemInfo.title,
                        fetched: false,
                        content: ""
                    });
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
                        //绝对路径转相对路径
                        let needConvertUrl = false;
                        let tmpUrl = aElement.href;
                        if (aElement.href.startsWith(baseUrl)) {
                            needConvertUrl = true;
                            tmpUrl = tmpUrl.substr(baseUrl.length);
                            if (tmpUrl.startsWith("#")) {
                                tmpUrl = "/" + tmpUrl;
                            }
                        }
                        if (needConvertUrl) {
                            let sPos = tmpUrl.indexOf("/");
                            if (sPos < 0) {
                                sPos = tmpUrl.indexOf("#");
                            }
                            if (sPos >= 0) {
                                tmpUrl = tmpUrl.substr(0, sPos);
                            }
                            if (tmpUrl.length === 0) {
                                tmpUrl = "index";
                            }
                            aElement.href = tmpUrl + ".html" + aElement.hash;
                        }
                    }
                    //删除script标签
                    let scriptList = doc.querySelectorAll("script");
                    for (let scriptIndex = 0; scriptIndex < scriptList.length; scriptIndex++) {
                        let tmpScript = scriptList.item(scriptIndex);
                        tmpScript.parentNode.removeChild(tmpScript);
                    }
                    //代码高亮
                    //doc.querySelectorAll("pre code").forEach((codeElement) => {
                    //    window.Prism.highlightElement(codeElement);
                    //});
                    //
                    window.pageData[pageIndex].content = doc.querySelector(".page__content").outerHTML;
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

    function loadScriptList(itemList, fn) {
        if (itemList.length > 0) {
            loadScript(itemList[0].name, itemList[0].url, function () {
                loadScriptList(itemList.slice(1), fn);
            });
        } else {
            fn();
        }
    }

    loadScriptList([
        {name: "io", url: "//lib.baomitu.com/socket.io/2.2.0/socket.io.js"},
        {name: "axios", url: "//lib.baomitu.com/axios/0.18.0/axios.min.js"}
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
