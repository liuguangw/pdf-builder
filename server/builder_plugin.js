import bodyParser from "body-parser"
import {Server} from "socket.io";
import bookListHandler from "./handlers/book_list.js";
import bookInfoHandler from "./handlers/book_info.js";
import bookBuildHandler from "./handlers/book_build.js";
import saveBookMenuHandler from "./handlers/save_book_menu.js";
import saveBookContentHandler from "./handlers/save_book_content.js";
import saveBookImageHandler from "./handlers/save_book_image.js";
import notifyCanBuildHandler from "./handlers/notify_can_build.js";
import path from "path";
import {normalizePath} from "vite";
import {clearBookInfoCache} from "./lib/load_book_info.js";

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
    useHttpHandler(middlewares, "POST", "/api/book-build", bookBuildHandler(io))
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

/**
 *
 * @param {HmrContext} ctx
 */
function handleHotUpdate(ctx) {
    const fPath = ctx.file
    //console.log(fPath)
    //console.log(ctx.modules)
    const configFilename = "config.yml"
    if (!fPath.endsWith(configFilename)) {
        return
    }
    const {ws, config} = ctx.server;
    const projectsDir = normalizePath(path.join(config.root, "server", "projects"))
    //console.log(projectsDir)
    if (!fPath.startsWith(projectsDir)) {
        return
    }
    const posA = projectsDir.length + 1
    const posB = fPath.length - configFilename.length - 1
    if (posB <= posA) {
        return
    }
    const projectName = fPath.substring(posA, posB)
    //console.log(projectName)
    const logMessage = `${path.relative(process.cwd(), fPath)} changed, clear cache...`;
    config.logger.info(logMessage, {
        clear: true,
        timestamp: true
    });
    clearBookInfoCache(projectName)
    //hmr 通知前端刷新页面
    const updates = [];
    ["BookList", "BookProject"].forEach((dirName) => {
        let vuePath = `/src/views/${dirName}/${dirName}.vue`
        updates.push({
            type: "js-update",
            path: vuePath,
            acceptedPath: vuePath,
            timestamp: ctx.timestamp
        })
    });
    ws.send({
        type: 'update',
        updates
    })
}

export default function builderPlugin() {
    return {
        name: "pdf-builder-plugin",
        configureServer,
        configurePreviewServer: configureServer,
        handleHotUpdate
    };
}
