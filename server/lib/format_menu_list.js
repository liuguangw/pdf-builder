export default function formatMenuList(menuList, depth) {
    let contextPrefix = "\t".repeat(depth + 1);
    if (depth > 1) {
        contextPrefix += "\t";
    }
    let ulCode = contextPrefix + "<ul>\n"
    for (let menuInfo of menuList) {
        if (menuInfo.filename !== "") {
            ulCode += (contextPrefix + "\t<li>\n" +
                contextPrefix + "\t\t" + "<a class=\"menu-link\" href=\"" + menuInfo.filename + "\">" + menuInfo.title + "</a>\n")
        } else {
            ulCode += (contextPrefix + "\t<li>\n" +
                contextPrefix + "\t\t" + "<span class=\"menu-title\">" + menuInfo.title + "</span>\n")
        }
        if ("children" in menuInfo) {
            if (menuInfo.children.length > 0) {
                ulCode += (formatMenuList(menuInfo.children, depth + 1) + "\n")
            }
        }
        ulCode += (contextPrefix + "\t</li>\n")
    }
    ulCode += (contextPrefix + "</ul>")
    return ulCode
}
