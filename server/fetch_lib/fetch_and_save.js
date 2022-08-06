import sleepAsync from "./sleep_async.js";
import processPage from "./process_page.js";

export default async function fetchAndSave(menuList, allPageList, apiEndpointInfo,sleepDuration,contextURL,fetchPage) {
    //保存menu信息
    try {
        let saveMenuResponse = await window.axios.post(apiEndpointInfo.menuApiURL, menuList)
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
        //抓取页面
        let contentEl = null;
        try {
            contentEl = await fetchPage(pageInfo.url);
            console.log("[" + postData.progress + "]fetch [" + pageInfo.title + " - " + pageInfo.filename + "] success");
        } catch (e) {
            hasFetchError = true;
            postData.status = 500;
            postData.message = "fetch " + pageInfo.url + " failed: " + e.message;
            console.error("[" + postData.progress + "]fetch [" + pageInfo.title + " - " + pageInfo.filename + "] failed: " + postData.message);
            continue
        }
        await processPage(contentEl, contextURL, postData.progress, apiEndpointInfo)
        postData.content = contentEl.outerHTML;
        //提交抓取结果给服务端
        try {
            await window.axios.post(apiEndpointInfo.contentApiURL, postData)
        } catch (e) {
            hasFetchError = true;
            console.error(e)
        }
    }
    //通知服务端可以构建了
    if (!hasFetchError) {
        await window.axios.post(apiEndpointInfo.notifyApiURL)
    }
}
