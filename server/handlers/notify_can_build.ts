import loadBookInfo from "../lib/load_book_info";
import {Server as SocketIoServer} from "socket.io";
import {Connect} from "vite";
import {IncomingMessage, ServerResponse} from "node:http";
import {ApiRequest} from "../common/request";
import {readJson, writeErrorResponse, writeSuccessResponse} from "../lib/json_tools";


/**
 * 处理can build通知
 */
export default function notifyCanBuildHandler(io: SocketIoServer): Connect.SimpleHandleFunction {
    return async function (req: IncomingMessage, resp: ServerResponse) {
        const reqBody: ApiRequest = await readJson(req);
        const bookName = reqBody.bookName;
        const bookInfo = await loadBookInfo(bookName)
        if (bookInfo === null) {
            writeErrorResponse(resp, "book " + bookName + " not found");
            return;
        }
        try {
            io.emit("can-build", bookName)
        } catch (e) {
            writeErrorResponse(resp, e.message);
            return;
        }
        writeSuccessResponse(resp);
    }
}
