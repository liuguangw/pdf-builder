import {ApiResponse} from "./common";

export default async function requestAPI(url:string, postData:any):Promise<ApiResponse> {
    let reqHeaders = new Headers();
    let reqBody = ""
    if (postData !== null) {
        reqHeaders.set("Content-Type", "application/json")
        reqBody = JSON.stringify(postData)
    }
    let fetchPageResponse = await window.fetch(url, {
        method: "POST",
        headers: reqHeaders,
        body: reqBody
    })
    return await fetchPageResponse.json()
}
