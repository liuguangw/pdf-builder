import {ApiResponse} from "../common/response";
import {ApiRequest} from "../common/request";

export default async function requestAPI<T>(url: string, postData: ApiRequest): Promise<ApiResponse<T>> {
    const reqHeaders = new Headers();
    let reqBody = ""
    if (postData !== null) {
        reqHeaders.set("Content-Type", "application/json")
        reqBody = JSON.stringify(postData)
    }
    const fetchPageResponse = await window.fetch(url, {
        method: "POST",
        headers: reqHeaders,
        body: reqBody
    })
    return await fetchPageResponse.json()
}
