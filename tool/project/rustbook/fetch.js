(function () {
    let baseUrl = "http://120.78.128.153/rustbook/";

    function clientInit(socket) {
        let itemList = document.querySelectorAll("#sidebar ol.chapter>li>a,#sidebar ol.chapter>li>ol.section>li>a");
        /*初始化菜单组*/
        let menuGroups = [];
        let pageStructLoaded = "pageData" in window;
        if (!pageStructLoaded) {
            /*初始化要抓取的网页结构*/
            window.pageData = [];
        }
        let urlNodes = [];
        for (let i = 0; i < itemList.length; i++) {

            (function (itemElement) {

                if (itemElement.parentNode.parentNode.className === "chapter") {
                    let groupInfo = {
                        title: itemElement.innerText,
                        url: itemElement.href.substr(baseUrl.length),
                        list: []
                    };
                    menuGroups.push(groupInfo);
                    urlNodes.push(groupInfo);
                    if (!pageStructLoaded) {
                        window.pageData.push({
                            url: groupInfo.url,
                            title: groupInfo.title,
                            fetched: false,
                            content: ""
                        });
                    }
                } else {
                    let menuItemInfo = {
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
                        //链接href属性 => 完整URL
                        if (aElement.getAttribute("href") !== aElement.href) {
                            aElement.setAttribute("href", aElement.href);
                        }
                        //绝对路径转相对路径
                        if (aElement.href.startsWith(baseUrl)) {
                            let tmpUrl = aElement.href.substr(baseUrl.length);
                            if (tmpUrl.endsWith("/")) {
                                tmpUrl = tmpUrl.substr(0, tmpUrl.length - 1);
                            }
                            aElement.href = tmpUrl.replace("/", "-");
                        }
                    }
                    //删除script标签
                    let scriptList = doc.querySelectorAll("script");
                    for (let scriptIndex = 0; scriptIndex < scriptList.length; scriptIndex++) {
                        let tmpScript = scriptList.item(scriptIndex);
                        tmpScript.parentNode.removeChild(tmpScript);
                    }
                    //代码高亮
                    docHighlight(doc);
                    //有问题的代码图标
                    processFerrises(doc);
                    //图片链接
                    let docImgs = doc.getElementsByTagName("img");
                    for (let imgIndex = 0; imgIndex < docImgs.length; imgIndex++) {
                        let docImg = docImgs.item(imgIndex);
                        let docImgSrc = docImg.getAttribute("src");
                        if (docImgSrc.startsWith("img")) {
                            docImg.setAttribute("src", baseUrl + docImgSrc);
                        }
                    }
                    //
                    window.pageData[pageIndex].content = doc.querySelector("#content main").outerHTML;
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

            let code_block = block;
            let pre_block = block.parentNode;
            // hide lines
            let lines = code_block.innerHTML.split("\n");
            let first_non_hidden_line = false;
            let lines_hidden = false;
            let trimmed_line = "";

            for (let n = 0; n < lines.length; n++) {
                trimmed_line = lines[n].trim();
                if (trimmed_line[0] == hiding_character && trimmed_line[1] != hiding_character) {
                    if (first_non_hidden_line) {
                        lines[n] = "<span class=\"hidden\">" + "\n" + lines[n].replace(/(\s*)# ?/, "$1") + "</span>";
                    } else {
                        lines[n] = "<span class=\"hidden\">" + lines[n].replace(/(\s*)# ?/, "$1") + "\n" + "</span>";
                    }
                    lines_hidden = true;
                } else if (first_non_hidden_line) {
                    lines[n] = "\n" + lines[n];
                } else {
                    first_non_hidden_line = true;
                }
                if (trimmed_line[0] == hiding_character && trimmed_line[1] == hiding_character) {
                    lines[n] = lines[n].replace("##", "#")
                }
            }
            code_block.innerHTML = lines.join("");

            // If no lines were hidden, return
            if (!lines_hidden) {
                return;
            }

            let buttons = document.createElement('div');
            buttons.className = 'buttons';
            buttons.innerHTML = "<button class=\"fa fa-expand\" title=\"Show hidden lines\" aria-label=\"Show hidden lines\"></button>";

            // add expand button
            pre_block.insertBefore(buttons, pre_block.firstChild);

            pre_block.querySelector('.buttons').addEventListener('click', function (e) {
                if (e.target.classList.contains('fa-expand')) {
                    let lines = pre_block.querySelectorAll('span.hidden');

                    e.target.classList.remove('fa-expand');
                    e.target.classList.add('fa-compress');
                    e.target.title = 'Hide lines';
                    e.target.setAttribute('aria-label', e.target.title);

                    Array.from(lines).forEach(function (line) {
                        line.classList.remove('hidden');
                        line.classList.add('unhidden');
                    });
                } else if (e.target.classList.contains('fa-compress')) {
                    let lines = pre_block.querySelectorAll('span.unhidden');

                    e.target.classList.remove('fa-compress');
                    e.target.classList.add('fa-expand');
                    e.target.title = 'Show hidden lines';
                    e.target.setAttribute('aria-label', e.target.title);

                    Array.from(lines).forEach(function (line) {
                        line.classList.remove('unhidden');
                        line.classList.add('hidden');
                    });
                }
            });
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
            let sc = document.createElement("script");
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
        {name: "axios", url: "//lib.baomitu.com/axios/0.18.0/axios.min.js"},
        {name: "highlight", url: "/rustbook/highlight.js"}
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
