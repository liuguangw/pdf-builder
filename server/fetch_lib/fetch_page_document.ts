import fetchPageContent from "./fetch_page_content";

const parser: DOMParser = new DOMParser();
/**
 * 请求网页并解析为Document对象
 * @param pageURL 网页url
 */
export default async function fetchPageDocument(pageURL: string): Promise<Document> {
    let contentHtml: string = await fetchPageContent(pageURL)
    return parser.parseFromString(contentHtml, "text/html");
}
