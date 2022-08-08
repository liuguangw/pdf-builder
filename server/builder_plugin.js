import bodyParser from "body-parser"
import bookListHandler from "./handlers/book_list.js";
import bookInfoHandler from "./handlers/book_info.js";
import {Server} from "socket.io";
import saveBookMenuHandler from "./handlers/save_book_menu.js";
import saveBookContentHandler from "./handlers/save_book_content.js";
import saveBookImageHandler from "./handlers/save_book_image.js";
import buildBookHandler from "./handlers/build_book.js";
import notifyCanBuildHandler from "./handlers/notify_can_build.js";

/**
 *
 * @param {Connect.Server} middlewares
 * @param {string} method
 * @param {string} path
 * @param {SimpleHandleFunction} handler
 */
function useHttpHandler(middlewares, method, path, handler) {
    middlewares.use(path, (req, res, next) => {
        if (req.method !== method) {
            next();
            return;
        }
        let corsOrigin = req.headers.origin
        if (corsOrigin === undefined) {
            corsOrigin = "*"
        }
        res.setHeader("Access-Control-Allow-Origin", corsOrigin);
        handler(req, res);
    })
}

function loadRoutes(middlewares, io) {
    useHttpHandler(middlewares, "GET", "/api/books", bookListHandler)
    useHttpHandler(middlewares, "POST", "/api/book-info", bookInfoHandler)
    useHttpHandler(middlewares, "POST", "/api/book-menu-info", saveBookMenuHandler(io))
    useHttpHandler(middlewares, "POST", "/api/book-content", saveBookContentHandler(io))
    useHttpHandler(middlewares, "POST", "/api/book-images", saveBookImageHandler(io))
    useHttpHandler(middlewares, "POST", "/api/book-build", buildBookHandler(io))
    useHttpHandler(middlewares, "POST", "/api/book-can-build", notifyCanBuildHandler(io))
}

function configureServer(server) {
    const io = new Server(server.httpServer, { /* options */});
    io.on("connection", (socket) => {
        socket.on("terminal-ready", () => {
            socket.emit("hello-message", "hello from socket.io server");
        });
    });
    //
    server.middlewares.use(bodyParser.json({
        limit: "2MB"
    }))
    loadRoutes(server.middlewares, io)
}

export default function builderPlugin() {
    return {
        name: "pdf-builder-plugin",
        configureServer,
        configurePreviewServer: configureServer
    };
}
