/**
 * 抓取网页内容
 * @param pageURL 网页地址
 */
export default async function fetchPageContent(pageURL: string): Promise<string> {
    let fetchPageResponse = await window.fetch(pageURL);
    return await fetchPageResponse.text();
}
