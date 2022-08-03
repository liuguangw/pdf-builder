import express from "express";
import http from "http";
import {Server} from "socket.io";
import bookListHandler from "./handlers/book_list.js"
import error404Handler from "./handlers/error_404.js"

const httpHost = "127.0.0.1";
const httpPort = 3000;
//编译后的web前端目录
const staticHandler = express.static("./dist");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { /* options */});

io.on("connection", (socket) => {
    // ...
});
//static files
app.use(staticHandler);
//routes
app.get("/api/books", bookListHandler);
//http 404 handler
app.use(error404Handler);
console.log("listen http://" + httpHost + ":" + httpPort);
httpServer.listen(httpPort, httpHost);
