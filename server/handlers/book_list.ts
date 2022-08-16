import loadBookList from '../lib/load_book_list'
import { IncomingMessage, ServerResponse } from 'node:http'
import { writeSuccessResponse } from '../lib/json_tools'

/**
 * 文档列表
 * @param req
 * @param resp
 */
export default async function bookListHandler(req: IncomingMessage, resp: ServerResponse) {
  const items = await loadBookList()
  writeSuccessResponse(resp, items)
}
