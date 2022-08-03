import replaceURL from "./replace_url.js";

function formatMenuList(contextURL,menuList,depth){
    let contextPrefix = ""
    if (depth>0){
        contextPrefix = "\t".repeat(depth)
    }
    let ulCode =contextPrefix+ "<ul>\n"
    for(let menuIndex in menuList){
        let menuInfo = menuList[menuIndex];
        if (menuInfo.href!==""){
            ulCode+=(contextPrefix+"\t<li><a class=\"menu-link\" href=\""+replaceURL(menuInfo.href,contextURL)+"\">"+menuInfo.title+"</a>")
        }else{
            ulCode+=(contextPrefix+"\t<li><span class=\"menu-title\">"+menuInfo.title+"</span>")
        }
        if("children" in menuInfo){
            if(menuInfo.children.length>0){
                ulCode+=("\n"+formatMenuList(contextURL,menuInfo.children,depth+1)+"\n")
            }
        }
        ulCode+="</li>\n"
    }
    ulCode+=(contextPrefix+"</ul>")
    return  ulCode
}
export default formatMenuList
