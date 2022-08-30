import loadBookInfo from '../lib/load_book_info'
import { projectDistDir } from '../lib/path_helper'
import { mkdir, open, rename, stat } from 'node:fs/promises'
import axios from 'axios'
import md5 from 'crypto-js/md5.js'
import { Server as SocketIoServer } from 'socket.io'
import { Connect } from 'vite'
import { IncomingMessage, ServerResponse } from 'node:http'
import { ImageApiRequest } from '../common/request'
import { readJson, writeErrorResponse, writeSuccessResponse } from '../lib/json_tools'

function formatImageFileName(srcURL: string, imageExt: string) {
  return md5(srcURL) + '.' + imageExt
}

/**
 * 从图片url中获取图片文件后缀,如果获取失败,则返回空字符串
 * @param imageURL
 */
function getImageExtFromUrl(imageURL: string): string {
  const commonExtList = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp']
  const imageURLInfo = new URL(imageURL)
  let imageExt = ''
  for (const extName of commonExtList) {
    if (imageURLInfo.pathname.endsWith('.' + extName)) {
      imageExt = extName
      break
    }
  }
  return imageExt
}

/**
 *
 * @param contentType
 */
function getImageExt(contentType: string): string {
  let imageExt = 'png'
  const pos = contentType.indexOf('/')
  if (pos !== -1) {
    imageExt = contentType.substring(pos + 1)
    if (imageExt === 'jpeg') {
      imageExt = 'jpg'
    } else if (imageExt === 'svg+xml') {
      imageExt = 'svg'
    }
  }
  return imageExt
}

/**
 * 判断图片url对应的本地文件是否已经存在
 * @param filename
 * @param saveDir
 */
async function isImageCacheExists(filename: string, saveDir: string): Promise<boolean> {
  let imgFilePathExists = false
  const imgFilePath = saveDir + '/' + filename
  //判断图片文件是否已经存在
  try {
    await stat(imgFilePath)
    imgFilePathExists = true
  } catch (e) {}
  return imgFilePathExists
}

/**
 * 下载图片,并返回文件名
 */
async function downloadImage(saveDir: string, imageURL: string, imageExt: string, referer: string): Promise<string> {
  const fetchResult = await axios.get(imageURL, {
    responseType: 'stream',
    headers: {
      Referer: referer
    },
    timeout: 60 * 1000
  })
  let needCheckCache = false
  if (imageExt === '') {
    imageExt = getImageExt(fetchResult.headers['content-type'])
    needCheckCache = true
  }
  const filename = formatImageFileName(imageURL, imageExt)
  if (needCheckCache) {
    const imgFilePathExists = await isImageCacheExists(filename, saveDir)
    //文件存在,直接返回,不继续下载
    if (imgFilePathExists) {
      return filename
    }
  }
  //开始下载到临时文件
  const tmpFilename = 'tmp.' + imageExt
  const imgFilePath = saveDir + '/' + filename
  const tmpFilePath = saveDir + '/' + tmpFilename
  const streamReader: IncomingMessage = fetchResult.data
  const streamFn = new Promise((resolve, reject) => {
    streamReader.on('end', resolve)
    // This is here incase any errors occur
    streamReader.on('error', reject)
  })
  const fd = await open(tmpFilePath, 'w')
  const streamWriter = fd.createWriteStream()
  streamReader.pipe(streamWriter)
  try {
    await streamFn
  } catch (err) {
    streamWriter.end()
    throw err
  }
  //下载成功后执行rename
  await rename(tmpFilePath, imgFilePath)
  return filename
}

/**
 *
 */
export async function saveBookImage(bookDistDir: string, imageURL: string, referer: string): Promise<string> {
  const imgDirName = 'images'
  const saveDir = bookDistDir + '/' + imgDirName
  //如果目录不存在,创建目录
  try {
    await stat(saveDir)
  } catch (e) {
    await mkdir(saveDir)
  }
  const imageExt = getImageExtFromUrl(imageURL)
  if (imageExt !== '') {
    const filename = formatImageFileName(imageURL, imageExt)
    const imgFilePathExists = await isImageCacheExists(filename, saveDir)
    //文件存在,直接返回,不发出http请求
    if (imgFilePathExists) {
      return imgDirName + '/' + filename
    }
  }
  const filename = await downloadImage(saveDir, imageURL, imageExt, referer)
  return imgDirName + '/' + filename
}

/**
 * 保存网页图片
 */
export default function saveBookImageHandler(io: SocketIoServer): Connect.SimpleHandleFunction {
  return async function (req: IncomingMessage, resp: ServerResponse) {
    const reqBody: ImageApiRequest = await readJson(req)
    const bookName = reqBody.bookName
    const bookInfo = await loadBookInfo(bookName)
    if (bookInfo === null) {
      writeErrorResponse(resp, 'book ' + bookName + ' not found')
      return
    }
    const imageURL = reqBody.url
    const imageType = reqBody.imageType
    //不需要fetch的图片,例如data url、重复的图片url
    if (imageType !== 0) {
      writeSuccessResponse(resp, imageURL)
      io.emit('fetch-img-skip', bookName, reqBody.progress, imageURL)
      return
    }
    const bookDistDir = projectDistDir(bookName)
    let saveFileName = ''
    try {
      saveFileName = await saveBookImage(bookDistDir, imageURL, bookInfo.docURL)
    } catch (e) {
      io.emit('fetch-img-error', bookName, reqBody.progress, imageURL, e.message)
      writeErrorResponse(resp, e.message)
      return
    }
    io.emit('fetch-img-success', bookName, reqBody.progress, imageURL)
    writeSuccessResponse(resp, saveFileName)
  }
}
