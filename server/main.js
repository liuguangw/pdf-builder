import express from "express";
import cors from "cors";
import http from "http";
import {Server} from "socket.io";
import bookListHandler from "./handlers/book_list.js"
import error404Handler from "./handlers/error_404.js"
import bookInfoHandler from "./handlers/book_info.js";
import saveBookMenuHandler from "./handlers/save_book_menu.js"
import saveBookContentHandler from "./handlers/save_book_content.js";
import buildBookHandler from "./handlers/build_book.js";
import notifyCanBuildHandler from "./handlers/notify_can_build.js";
import saveBookImageHandler from "./handlers/save_book_image.js";

const httpHost = "127.0.0.1";
const httpPort = 3000;
//编译后的web前端目录
const staticHandler = express.static("./dist");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { /* options */});
io.on("connection", (socket) => {
    socket.on("terminal-ready", () => {
        socket.emit("hello-message", "hello from socket.io server");
    });
});
//static files
app.use(staticHandler);
app.use(cors());
app.use(express.json({
    limit: "2MB"
}));
//routes
app.get("/api/books", bookListHandler);
app.get("/api/books/:bookName/info", bookInfoHandler);
app.post("/api/books/:bookName/menu-info", saveBookMenuHandler(io))
app.post("/api/books/:bookName/content", saveBookContentHandler(io))
app.post("/api/books/:bookName/images", saveBookImageHandler(io))
app.post("/api/books/:bookName/build", buildBookHandler(io))
app.post("/api/books/:bookName/can-build", notifyCanBuildHandler(io))
//http 404 handler
app.use(error404Handler);
console.log("listen http://" + httpHost + ":" + httpPort);
httpServer.listen(httpPort, httpHost);
