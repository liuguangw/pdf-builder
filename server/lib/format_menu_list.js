export default function formatMenuList(menuList, depth) {
    let contextPrefix = "\n" + "\t".repeat(depth * 2 + 1);
    let ulCode = contextPrefix + "<ul>"
    for (let menuInfo of menuList) {
        let liPrefix = contextPrefix + "\t"
        ulCode += (liPrefix + "<li>")
        //特殊字符转实体(Entity)
        let titleText = menuInfo.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        if (menuInfo.filename !== "") {
            ulCode += `${liPrefix}\t<a class="menu-link" href="${menuInfo.filename}">${titleText}</a>`
        } else {
            ulCode += `${liPrefix}\t<span class="menu-title">${titleText}</span>`
        }
        if ("children" in menuInfo) {
            if (menuInfo.children.length > 0) {
                ulCode += formatMenuList(menuInfo.children, depth + 1)
            }
        }
        ulCode += (liPrefix + "</li>")
    }
    ulCode += (contextPrefix + "</ul>")
    return ulCode
}
