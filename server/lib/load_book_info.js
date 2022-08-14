import {projectDir} from "./path_helper.js";
import {readFile} from 'fs/promises';
import yaml from "js-yaml";

const ymlContentMap = new Map();

/**
 * 清理book信息缓存
 *
 * @param {string} bookName
 * @return {void}
 */
export function clearBookInfoCache(bookName) {
    ymlContentMap.delete(bookName)
}

/**
 * 获取book信息
 *
 * @param {string} bookName
 * @return {Promise<Object>}
 */
export default async function loadBookInfo(bookName) {
    let bookInfo = null;
    if (ymlContentMap.has(bookName)) {
        //console.log("match " + bookName)
        bookInfo = ymlContentMap.get(bookName)
    } else {
        //console.log("load " + bookName)
        let configFilePath = projectDir(bookName) + "/config.yml";
        try {
            const ymlContent = await readFile(configFilePath, {
                encoding: "utf-8"
            })
            bookInfo = yaml.load(ymlContent, {
                filename: configFilePath
            });
        } catch (e) {
            bookInfo = null
            console.error(e)
        }
        ymlContentMap.set(bookName, bookInfo)
        if (bookInfo !== null) {
            //注入projectName、默认排序值
            bookInfo.projectName = bookName
            if (!("order" in bookInfo)) {
                bookInfo.order = 0
            }
        }
    }
    return bookInfo
}
