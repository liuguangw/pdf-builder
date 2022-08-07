/**
 *
 * @param {string} url
 * @param {Object|null} postData
 * @return {Promise<Object>}
 */
export default async function requestAPI(url, postData) {
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
