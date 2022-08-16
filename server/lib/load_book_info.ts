import { projectDir } from './path_helper'
import { readFile } from 'fs/promises'
import yaml from 'js-yaml'
import { BookInfo } from './common'

const ymlContentMap = new Map<string, BookInfo>()

/**
 * 清理book信息缓存
 * @param bookName
 */
export function clearBookInfoCache(bookName: string) {
  ymlContentMap.delete(bookName)
}

/**
 * 获取book信息
 * @param bookName
 */
export default async function loadBookInfo(bookName: string): Promise<BookInfo> {
  let bookInfo: BookInfo = null
  if (ymlContentMap.has(bookName)) {
    //console.log("match " + bookName)
    bookInfo = ymlContentMap.get(bookName)
  } else {
    //console.log("load " + bookName)
    const configFilePath = projectDir(bookName) + '/config.yml'
    try {
      const ymlContent = await readFile(configFilePath, {
        encoding: 'utf-8'
      })
      bookInfo = yaml.load(ymlContent, {
        filename: configFilePath
      })
    } catch (e) {
      bookInfo = null
      console.error(e)
    }
    ymlContentMap.set(bookName, bookInfo)
    if (bookInfo !== null) {
      //注入projectName、默认排序值
      bookInfo.projectName = bookName
      if (!('order' in bookInfo)) {
        bookInfo.order = 0
      }
    }
  }
  return bookInfo
}
