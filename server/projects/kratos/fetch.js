await (async function () {
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
    //api定义
    const apiPrefix = " http://127.0.0.1:3000"
    const projectName = "kratos"
    const menuApiURL = apiPrefix + "/api/books/" + projectName + "/menu-info"
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
    let menuRootEl = document.querySelector(".theme-doc-sidebar-menu.menu__list");
    for (let itemIndex = 0; itemIndex < menuRootEl.children.length; itemIndex++) {
        let childEl = menuRootEl.children.item(itemIndex);
        if (childEl.tagName.toLowerCase() !== "li") {
            continue;
        }
        /**
         *
         * @type {HTMLAnchorElement}
         */
        let menuLink = childEl.querySelector("div>a.menu__link");
        let subMenuUlEl = childEl.querySelector("ul.menu__list");
        let menuGroup = {
            title: menuLink.innerText,
            href: menuLink.href,
            children: []
        }
        /**
         *
         * @type {NodeListOf<HTMLAnchorElement>}
         */
        let subMenuLinkList = subMenuUlEl.querySelectorAll("a.menu__link");
        for (let subMenuElIndex = 0; subMenuElIndex < subMenuLinkList.length; subMenuElIndex++) {
            let subMenuEl = subMenuLinkList.item(subMenuElIndex);
            menuGroup.children.push({
                title: subMenuEl.innerText,
                href: subMenuEl.href
            })
        }
        menuList.push(menuGroup)
    }
    console.log(menuList)
    console.log(JSON.stringify(menuList))
    try {
        let saveMenuResponse = await window.axios.post(menuApiURL, menuList)
        console.log(saveMenuResponse)
    } catch (e) {
        console.error(e)
    }
})();
