import sleepAsync from "./sleep_async";
import processPage from "./process_page";
import requestAPI from "./request_api.js";
import {PageInfo, fetchPageHandler, ApiResponse, ContentApiRequest, FetchedImageInfo, MenuApiRequest} from "./common";
import ApiEndpoint from "./api_endpoint";

export default async function fetchAndSave(menuList: any[], allPageList: PageInfo[], projectName: string,
                                           sleepDuration: number, contextURL: string, fetchPage: fetchPageHandler): Promise<void> {
    let apiEndpointInfo = new ApiEndpoint(projectName);
    //保存menu信息
    try {
        let menuInfoRequest: MenuApiRequest = {
            bookName: projectName,
            menuList
        };
        let saveMenuResponse: ApiResponse = await requestAPI(apiEndpointInfo.menuApiURL, menuInfoRequest)
        if (saveMenuResponse.code !== 0) {
            console.error(saveMenuResponse.message);
            return;
        } else {
            console.log("save menu success");
        }
    } catch (e) {
        console.error(e);
        return;
    }
    let hasFetchError = false;
    let imageFetchList: FetchedImageInfo[] = [];
    for (let pageIndex = 0; pageIndex < allPageList.length; pageIndex++) {
        let pageInfo = allPageList[pageIndex];
        if (pageIndex > 0) {
            await sleepAsync(sleepDuration);
        }
        let postData: ContentApiRequest = {
            bookName: projectName,
            title: pageInfo.title,
            filename: pageInfo.filename,
            content: "",
            progress: (pageIndex + 1) + "/" + allPageList.length,
            status: 0,
            message: ""
        }
        //抓取页面
        let contentEl: HTMLElement = null;
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
        await processPage(contentEl, contextURL, postData.progress, apiEndpointInfo, imageFetchList)
        postData.content = contentEl.outerHTML;
        //提交抓取结果给服务端
        try {
            await requestAPI(apiEndpointInfo.contentApiURL, postData)
        } catch (e) {
            hasFetchError = true;
            console.error(e)
        }
    }
    //
    //console.log(imageFetchList)
    //通知服务端可以构建了
    if (!hasFetchError) {
        await requestAPI(apiEndpointInfo.notifyApiURL, {
            bookName: projectName
        })
    }
}
