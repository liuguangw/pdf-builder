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
async function handleHotUpdate(ctx) {
    const fPath = ctx.file
    if (!fPath.endsWith("config.yml")) {
        return
    }
    //console.log(fPath)
    //console.log(ctx.modules)
    const {config} = ctx.server;
    const projectsDir = path.join(config.root, "server", "projects").replace(/\\/g, "/")
    //console.log(projectsDir)
    if (!fPath.startsWith(projectsDir)) {
        return
    }
    config.logger.info(`${path.relative(process.cwd(), fPath)} changed, restarting server...`, {
        clear: true,
        timestamp: true
    });
    try {
        await ctx.server.restart();
    } catch (e) {
        config.logger.error(e)
    }
}

export default function builderPlugin() {
    return {
        name: "pdf-builder-plugin",
        configureServer,
        configurePreviewServer: configureServer,
        //handleHotUpdate
    };
}
