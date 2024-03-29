import { mkdir, stat, writeFile } from 'fs/promises'
import formatMenuList from '../lib/format_menu_list'
import { projectDistDir } from '../lib/path_helper'
import loadBookInfo from '../lib/load_book_info'
import { Server as SocketIoServer } from 'socket.io'
import { Connect } from 'vite'
import { IncomingMessage, ServerResponse } from 'node:http'
import { readJson, writeErrorResponse, writeSuccessResponse } from '../lib/json_tools'
import { MenuApiRequest } from '../common/request'
import { ServerMenuInfo } from '../common/menu_info'
import { BookInfo } from '../lib/common'
import moment from 'moment'

function formatMenuHtml(projectName: string, bookTitle: string, menuList: ServerMenuInfo[]) {
  const menuListHtml = formatMenuList(menuList, 1)
  const buildTime = moment().format('Y-MM-DD HH:mm:ss(Z)')
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>目录 - ${bookTitle}</title>
    <link rel="stylesheet" href="../../../css/menu.css" />
    </head>
    <body>
        <div class="book-main-title">
            <h1 class="pdf-toc1">目录</h1>
        </div>
        <div class="menu-list">${menuListHtml}
        </div>
        <div class="menu-tip">
        <span>Generated by</span>
        <a href="https://github.com/liuguangw/pdf-builder">pdf-builder</a>
        <span class="build-time">[${buildTime}]</span>
        </div>
    </body>
</html>`
}

async function saveBookMenu(bookInfo: BookInfo, menuList: ServerMenuInfo[]) {
  const projectName = bookInfo.projectName
  const menuHtml = formatMenuHtml(projectName, bookInfo.title, menuList)
  //如果dist目录不存在,自动创建
  const saveDir = projectDistDir(projectName)
  try {
    await stat(saveDir)
  } catch (e) {
    await mkdir(saveDir)
  }
  const savePath = saveDir + '/__entry.html'
  await writeFile(savePath, menuHtml)
}

/**
 * 保存menu信息
 */
export default function saveBookMenuHandler(io: SocketIoServer): Connect.SimpleHandleFunction {
  return async function (req: IncomingMessage, resp: ServerResponse) {
    const reqBody: MenuApiRequest = await readJson(req)
    const bookName = reqBody.bookName
    const bookInfo = await loadBookInfo(bookName)
    if (bookInfo === null) {
      writeErrorResponse(resp, 'book ' + bookName + ' not found')
      return
    }
    try {
      await saveBookMenu(bookInfo, reqBody.menuList)
      io.emit('save-menu-success', bookName)
    } catch (e) {
      writeErrorResponse(resp, e.message)
      return
    }
    writeSuccessResponse(resp)
  }
}
