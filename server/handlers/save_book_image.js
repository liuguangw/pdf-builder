import loadBookInfo from "../lib/load_book_info.js";
import {projectDistDir} from "../lib/path_helper.js";
import {mkdir, stat, open} from "fs/promises";
import axios from "axios";
import md5 from 'crypto-js/md5.js';

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
    let fetchResult = await axios.get(imageURL, {
        responseType: "stream",
        headers: {
            "Referer": referer
        }
    })
    //console.log(fetchResult.status, fetchResult.headers["content-type"])
    let filename = imgDirName + "/" + formatImageURL(imageURL, fetchResult.headers["content-type"])
    let streamReader = fetchResult.data
    const fd = await open(bookDistDir + "/" + filename, "w");
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
    await streamFn;
    streamWriter.close()
    await fd.close()
    return filename
    //await writeFile(htmlPath, contentHtml);
}

function formatImageURL(srcURL, contentType) {
    let imageType = "png"
    let pos = contentType.indexOf("/")
    if (pos !== -1) {
        imageType = contentType.substring(pos + 1)
        if (imageType === "jpeg") {
            imageType = "jpg"
        } else if (imageType === "svg+xml") {
            imageType = "svg"
        }
    }
    return md5(srcURL) + "." + imageType
}

/**
 * 保存网页图片
 */
export default function saveBookImageHandler(io) {
    return async function (req, resp) {
        let bookName = req.params.bookName;
        let bookInfo = await loadBookInfo(bookName)
        if (bookInfo === null) {
            resp.json({
                code: 4000,
                data: null,
                message: "book " + bookName + " not found"
            });
            return;
        }
        let imageURL = req.body.url;
        if (imageURL === "<data URL>") {
            resp.json({
                code: 0,
                data: imageURL,
                message: ""
            });
            return;
        }
        let bookDistDir = projectDistDir(bookName);
        let saveFileName = ""
        //最多尝试下载图片次数
        const maxTryCount = 3
        try {
            for (let i = 0; i < maxTryCount; i++) {
                try {
                    if (i > 0) {
                        console.warn("[" + (i + 1) + "/" + maxTryCount + "]retry download " + imageURL)
                    }
                    saveFileName = await saveBookImage(bookDistDir, imageURL, bookInfo.docURL);
                    break
                } catch (err) {
                    //最后一次抛出err
                    if (maxTryCount - 1===i) {
                        throw err
                    }
                }
            }
            io.emit("save-img-success", bookName, req.body.progress, imageURL);
            resp.json({
                code: 0,
                data: saveFileName,
                message: ""
            });
        } catch (e) {
            io.emit("save-img-error", bookName, req.body.progress, imageURL, e.message);
            resp.json({
                code: 4000,
                data: null,
                message: e.message
            });
        }
    }
}
