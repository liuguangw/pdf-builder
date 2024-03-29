import fetchPageContent from './fetch_page_content'

const parser: DOMParser = new DOMParser()
/**
 * 请求网页并解析为Document对象
 * @param pageURL 网页url
 */
export default async function fetchPageDocument(pageURL: string): Promise<Document> {
  const contentHtml: string = await fetchPageContent(pageURL)
  return parseAsDocument(contentHtml)
}

export function parseAsDocument(contentHtml: string): Document {
  return parser.parseFromString(contentHtml, 'text/html')
}
