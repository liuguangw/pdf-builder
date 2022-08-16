import { projectDir } from './path_helper'
import esbuild from 'esbuild'
import { BookInfo } from './common'

/**
 * 加载完整抓取脚本
 */
export default async function loadBookFetchScript(bookInfo: BookInfo, serverURL: string): Promise<string> {
  const fetchJsPath = projectDir(bookInfo.projectName) + '/fetch.js'
  const sBookInfo = {
    projectName: bookInfo.projectName,
    docURL: bookInfo.docURL,
    contextURL: bookInfo.contextURL === undefined ? bookInfo.docURL : bookInfo.contextURL
  }
  let scriptContent
  try {
    const buildResult = await esbuild.build({
      entryPoints: [fetchJsPath],
      bundle: true,
      define: {
        VITE_SERVER_URL: JSON.stringify(serverURL),
        BOOK_PROJECT_INFO: JSON.stringify(sBookInfo)
      },
      //minify: true,
      write: false,
      target: ['chrome87', 'firefox78']
    })
    const buildItemResult = buildResult.outputFiles.pop()
    scriptContent = buildItemResult.text
  } catch (e) {
    scriptContent = '[ERROR] ' + e.message
    console.error(e)
  }
  return scriptContent
}
