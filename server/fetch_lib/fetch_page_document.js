import fetchPageContent from "./fetch_page_content.js";

const parser = new DOMParser();
/**
 *
 * @param {string} pageURL
 * @return {Promise<Document>}
 */
export default async function fetchPageDocument(pageURL) {
    let contentHtml = await fetchPageContent(pageURL)
    return parser.parseFromString(contentHtml, "text/html");
}
