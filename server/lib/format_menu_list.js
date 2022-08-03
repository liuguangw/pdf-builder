import replaceURL from "./replace_url.js";

function formatMenuList(contextURL, menuList, depth) {
    let contextPrefix = ""
    if (depth > 0) {
        contextPrefix = "\t".repeat(depth)
    }
    let ulCode = contextPrefix + "<ul>\n"
    for (let menuIndex in menuList) {
        let menuInfo = menuList[menuIndex];
        if (menuInfo.href !== "") {
            ulCode += (contextPrefix + "\t<li>\n" +
                contextPrefix + "\t\t" + "<a class=\"menu-link\" href=\"" + replaceURL(menuInfo.href, contextURL) + "\">" + menuInfo.title + "</a>\n")
        } else {
            ulCode += (contextPrefix + "\t<li>\n" +
                contextPrefix + "\t\t" + "<span class=\"menu-title\">" + menuInfo.title + "</span>\n")
        }
        if ("children" in menuInfo) {
            if (menuInfo.children.length > 0) {
                ulCode += (formatMenuList(contextURL, menuInfo.children, depth + 2) + "\n")
            }
        }
        ulCode +=(contextPrefix + "\t</li>\n")
    }
    ulCode += (contextPrefix + "</ul>")
    return ulCode
}

export default formatMenuList
