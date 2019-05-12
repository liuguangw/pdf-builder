(function () {
    let baseUrl = "https://lavas.baidu.com/pwa/";
    let apiContextUrl = "https://lavas.baidu.com/api/doc/";
    let parser = new DOMParser();

    function getPageDoc(pageHtmlCode) {
        return parser.parseFromString("<html>\n" +
            "<head><title>doc</title></head>\n" +
            "<body><div class=\"markdown-body\">\n" +
            pageHtmlCode
            + "\n</div></body>" +
            "</html>", "text/html")
    }

    function getMenuUrls(menuList) {
        let menuUrls = [];
        for (let i = 0; i < menuList.length; i++) {
            let menuInfo = menuList[i];
            let childMenuList = [];
            if (menuInfo.hasOwnProperty("children")) {
                childMenuList = menuInfo.children;
            }
            if (childMenuList.length === 0) {
                menuUrls.push({
                    title: menuInfo.name,
                    url: menuInfo.url
                });
            } else {
                menuUrls = menuUrls.concat(getMenuUrls(childMenuList));
            }
        }
        return menuUrls;
    }

    function clientInit(socket) {
        window.axios.get(apiContextUrl + "menu?url=%2Fpwa").then(function (response) {
            // handle success
            let resultResponse = response.data;
            if (resultResponse.status !== 0) {
                window.console.error("fetch menu data error !");
            } else {
                let menuList = resultResponse.data;
                let menuUrls = getMenuUrls(menuList);
                if (!("pageData" in window)) {
                    /*初始化要抓取的网页结构*/
                    window.pageData = [];
                    menuUrls.forEach(urlInfo => {
                        window.pageData.push({
                            url: urlInfo.url,
                            title: urlInfo.title,
                            fetched: false,
                            content: ""
                        });
                    });
                }
                socket.emit("app save_menu_info", menuList);
                /*传递URL链接给后端*/
                socket.emit("app save_urls", menuUrls);
                /*开始抓取网页*/
                setTimeout(function () {
                    fetchPage(0);
                }, 200);
            }
        }).catch(function (error) {
            window.console.error(error);
        });
    }

    function convertDocUrl(pageUrl, pageHash) {
        let pagePath = pageUrl;
        if (pageHash.length > 0) {
            pagePath = pageUrl.substr(0, pageUrl.length - pageHash.length);
        }
        //如果末尾有/，则除去
        if (pagePath.endsWith("/")) {
            pagePath = pagePath.substr(0, pagePath.length - 1);
        }
        //
        return pagePath.replace(/\//g, "-") + ".html" + pageHash.replace(/-/g, "");
    }

    function fetchPage(pageIndex) {
        //抓取时间延迟
        let fetchTimeFeq = 300;
        if (pageIndex < window.pageData.length) {
            /*已经抓取过了的,不再重复抓取*/
            if (window.pageData[pageIndex].fetched) {
                window.console.log("[" + (pageIndex + 1) + "/" + window.pageData.length + "]use cache - " + window.pageData[pageIndex].url);
                savePage(window.pageData[pageIndex].url, window.pageData[pageIndex].title, window.pageData[pageIndex].content);
                setTimeout(() => {
                    fetchPage(pageIndex + 1);
                }, fetchTimeFeq);
            } else {
                window.console.log("[" + (pageIndex + 1) + "/" + window.pageData.length + "]fetch - " + window.pageData[pageIndex].url);
                window.axios.get(apiContextUrl + "detail?url=" + encodeURIComponent(window.pageData[pageIndex].url)).then(function (response) {
                    let resultResponse = response.data;
                    if (resultResponse.status !== 0) {
                        window.console.error("fetch menu data error !");
                    } else {
                        let pageHtmlCode = resultResponse.data.html;
                        let doc = getPageDoc(pageHtmlCode);
                        doc.querySelectorAll("a").forEach(aElement => {
                            //链接href属性 => 完整URL
                            let linkUrl = aElement.getAttribute("href");
                            if (linkUrl.startsWith("/")) {
                                linkUrl = location.origin + linkUrl + aElement.hash;
                            } else if (linkUrl.startsWith("#")) {
                                linkUrl = location.origin + window.pageData[pageIndex].url + aElement.hash;
                                //console.log(linkUrl);
                                //console.log(aElement.hash);
                            }
                            //绝对路径转相对路径
                            if (linkUrl.startsWith(baseUrl)) {
                                aElement.setAttribute("href", convertDocUrl(linkUrl.substr(baseUrl.length), aElement.hash));
                            } else {
                                aElement.setAttribute("href", linkUrl);
                            }
                        });
                        //删除script标签
                        doc.querySelectorAll("script").forEach(tmpScript => {
                            tmpScript.parentNode.removeChild(tmpScript);
                        });
                        //图片链接
                        doc.querySelectorAll("img").forEach(docImg => {
                            let docImgSrc = docImg.getAttribute("src");
                            if (docImgSrc.indexOf("/") === 0) {
                                docImg.setAttribute("src", location.origin + docImgSrc);
                            }
                        });
                        //锚点
                        doc.querySelectorAll("h1,h2,h3").forEach(hEl => {
                            if (hEl.hasAttribute("data-hash")) {
                                hEl.setAttribute("id", hEl.getAttribute("data-hash").substr(1));
                            }
                        });
                        //代码高亮
                        /*doc.querySelectorAll('pre code').forEach((block) => {
                            window.hljs.highlightBlock(block);
                        });*/
                        //
                        window.pageData[pageIndex].content = doc.querySelector(".markdown-body").outerHTML;
                        window.pageData[pageIndex].fetched = true;
                        //save
                        savePage(window.pageData[pageIndex].url, window.pageData[pageIndex].title, window.pageData[pageIndex].content);
                        setTimeout(() => {
                            fetchPage(pageIndex + 1);
                        }, fetchTimeFeq);
                    }
                }).catch(function (error) {
                    window.console.error(error);
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
            window.socket = window.io("http://localhost:5006/fetch-api");
            window.socket.on('connect', function () {
                clientInit(window.socket);
            });
        }
    });
})();
