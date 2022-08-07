/**
 *
 * @param {string} pageURL
 * @return {Promise<string>}
 */
export default async function fetchPageContent(pageURL) {
    let fetchPageResponse = await window.fetch(pageURL);
    return await fetchPageResponse.text();
}
