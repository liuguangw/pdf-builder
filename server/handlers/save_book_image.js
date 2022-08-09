import {loadBaseBookInfo} from "../lib/load_book_info.js";
import {projectDistDir} from "../lib/path_helper.js";
import {mkdir, stat, open, copyFile, rm} from "fs/promises";
import axios from "axios";
import md5 from 'crypto-js/md5.js';
import writeJson from "../lib/write_json.js";

/**
 *
 * @param {string} bookDistDir
 * @param {string} imageURL
 * @param {string} referer
 * @return {Promise<string>}
 */
async function saveBookImage(bookDistDir, imageURL, referer) {
    let imgDirName = "images"
    let saveDir = bookDistDir + "/" + imgDirName
    try {
        await stat(saveDir)
    } catch (e) {
        await mkdir(saveDir)
    }
    let imageExt = getImageExtFromUrl(imageURL)
    let imgFilePathExists = false
    if (imageExt !== "") {
        let filename = formatImageFileName(imageURL, imageExt)
        let imgFilePath = saveDir + "/" + filename
        //判断图片文件是否已经存在
        try {
            await stat(imgFilePath)
            imgFilePathExists = true
        } catch (e) {
        }
        //文件存在,直接返回,不发出http请求
        if (imgFilePathExists) {
            return imgDirName + "/" + filename
        }
    }
    let fetchResult = await axios.get(imageURL, {
        responseType: "stream",
        headers: {
            "Referer": referer
        },
        timeout: 60 * 1000
    })
    //console.log(fetchResult.status, fetchResult.headers["content-type"])
    if (imageExt === "") {
        imageExt = getImageExt(fetchResult.headers["content-type"])
    }
    let filename = formatImageFileName(imageURL, imageExt)
    let tmpFilename = "tmp." + imageExt
    let imgFilePath = saveDir + "/" + filename
    let tmpFilePath = saveDir + "/" + tmpFilename
    //判断图片文件是否已经存在
    try {
        await stat(imgFilePath)
        imgFilePathExists = true
    } catch (e) {
    }
    //文件存在,直接返回,不继续下载
    if (imgFilePathExists) {
        return imgDirName + "/" + filename
    }
    //下载到临时文件
    let streamReader = fetchResult.data
    const fd = await open(tmpFilePath, "w");
    let streamWriter = await fd.createWriteStream();
    streamReader.pipe(streamWriter)
    let streamFn = new Promise((resolve, reject) => {
        streamReader.on('end', function () {
            resolve();
        });
        // This is here incase any errors occur
        streamReader.on('error', function (err) {
            reject(err);
        });
    });
    try {
        await streamFn;
    } catch (err) {
        throw err
    } finally {
        streamWriter.close()
        await fd.close()
    }
    //copy覆盖
    await copyFile(tmpFilePath, imgFilePath)
    await rm(tmpFilePath)
    return imgDirName + "/" + filename
    //await writeFile(htmlPath, contentHtml);
}

function formatImageFileName(srcURL, imageExt) {
    return md5(srcURL) + "." + imageExt
}

/**
 * 从图片url中获取图片文件后缀,如果获取失败,则返回空字符串
 *
 * @param {string} imageURL
 * @return {string}
 */
function getImageExtFromUrl(imageURL) {
    const commonExtList = ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"]
    let imageURLInfo = new URL(imageURL)
    let imageExt = ""
    for (let extName of commonExtList) {
        if (imageURLInfo.pathname.endsWith("." + extName)) {
            imageExt = extName
            break
        }
    }
    return imageExt
}

function getImageExt(contentType) {
    let imageExt = "png"
    let pos = contentType.indexOf("/")
    if (pos !== -1) {
        imageExt = contentType.substring(pos + 1)
        if (imageExt === "jpeg") {
            imageExt = "jpg"
        } else if (imageExt === "svg+xml") {
            imageExt = "svg"
        }
    }
    return imageExt
}

/**
 *
 * @param {string} bookDistDir
 * @param {string} imageURL
 * @param {string} referer
 * @return {Promise<string>}
 */
async function processSaveImage(bookDistDir, imageURL, referer) {
    //最多尝试下载图片次数
    const maxTryCount = 3
    let saveFileName = ""
    for (let i = 0; i < maxTryCount; i++) {
        try {
            if (i > 0) {
                console.warn("[" + (i + 1) + "/" + maxTryCount + "]retry download " + imageURL)
            }
            saveFileName = await saveBookImage(bookDistDir, imageURL, referer);
            break
        } catch (err) {
            //最后一次抛出err
            if (maxTryCount - 1 === i) {
                throw err
            }
        }
    }
    return saveFileName
}

/**
 * 保存网页图片
 */
export default function saveBookImageHandler(io) {
    return async function (req, resp) {
        let bookName = req.body.bookName;
        let bookInfo = loadBaseBookInfo(bookName)
        if (bookInfo === null) {
            writeJson(resp, {
                code: 4000,
                data: null,
                message: "book " + bookName + " not found"
            });
            return;
        }
        let imageURL = req.body.url;
        let imageType = req.body.imageType;
        //不需要fetch的图片,例如data url、重复的图片url
        if (imageType !== 0) {
            writeJson(resp, {
                code: 0,
                data: imageURL,
                message: ""
            });
            io.emit("fetch-img-skip", bookName, req.body.progress, imageURL);
            return;
        }
        let bookDistDir = projectDistDir(bookName);
        let saveFileName = ""
        try {
            saveFileName = await processSaveImage(bookDistDir, imageURL, bookInfo.docURL)
        } catch (e) {
            io.emit("fetch-img-error", bookName, req.body.progress, imageURL, e.message);
            writeJson(resp, {
                code: 4000,
                data: null,
                message: e.message
            });
            return
        }
        io.emit("fetch-img-success", bookName, req.body.progress, imageURL);
        writeJson(resp, {
            code: 0,
            data: saveFileName,
            message: ""
        });
    }
}
