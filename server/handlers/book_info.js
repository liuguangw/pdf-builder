import {loadBaseBookInfo} from "../lib/load_book_info.js";
import {addFetchScript} from "../lib/load_book_list.js";
import writeJson from "../lib/write_json.js";

/**
 *
 * @param {ServerOptions} serverConfig
 * @return {string}
 */
function parseServerURL(serverConfig) {
    let isHttps = false;
    if ("https" in serverConfig) {
        isHttps = serverConfig.https;
    }
    let hostname = "127.0.0.1";
    if ("host" in serverConfig) {
        hostname = serverConfig.host;
    }
    let port = 5173
    if ("port" in serverConfig) {
        port = serverConfig.port
    }
    let serverURL = isHttps ? "https" : "http";
    serverURL += ("://" + hostname);
    if (isHttps) {
        if (port !== 443) {
            serverURL += (":" + port)
        }
    } else if (port !== 80) {
        serverURL += (":" + port)
    }
    return serverURL;
}

/**
 * 书籍详情
 *
 * @param {Connect.IncomingMessage} req
 * @param resp
 */
export default async function bookInfoHandler(req, resp) {
    let bookName = req.body.bookName;
    let bookInfo = loadBaseBookInfo(bookName)
    let serverURL = req.headers.origin
    if (serverURL === undefined) {
        serverURL = "http" + "://" + req.headers.host
    }
    await addFetchScript(bookInfo, serverURL);
    if (bookInfo === null) {
        writeJson(resp, {
            code: 4000,
            data: null,
            message: "book " + bookName + " not found"
        });
        return;
    }
    writeJson(resp, {
        code: 0,
        data: bookInfo,
        message: ""
    });
}
