import express from "express";
import http from "http";
import {Server} from "socket.io";
import bookListHandler from "./handlers/book_list.js"
import error404Handler from "./handlers/error_404.js"
import bookInfoHandler from "./handlers/book_info.js";
import saveBookMenu from "./handlers/save_book_menu.js"

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
app.get("/api/books/:bookName/info", bookInfoHandler);
//http 404 handler
app.use(error404Handler);
console.log("listen http://" + httpHost + ":" + httpPort);
{
    await saveBookMenu("rustbook", [
        {
            title: "入门指南",
            href: "https://kaisery.github.io/trpl-zh-cn/ch01-00-getting-started.html",
            children: [
                {title: "安装", href: "https://kaisery.github.io/trpl-zh-cn/ch01-01-installation.html"},
                {title: "Hello, World!", href: "https://kaisery.github.io/trpl-zh-cn/ch01-02-hello-world.html"}
            ]
        },
        {title: "写个猜数字游戏", href: "https://kaisery.github.io/trpl-zh-cn/ch02-00-guessing-game-tutorial.html"},
        {
            title: "入门指南2",
            href: "",
            children: [
                {
                    title: "安装2", href: "https://kaisery.github.io/trpl-zh-cn/ch01-01-installation.html", children: [
                        {
                            title: "写个猜数字游戏1",
                            href: "https://kaisery.github.io/trpl-zh-cn/ch02-00-guessing-game-tutorial.html"
                        },
                        {
                            title: "写个猜数字游戏2",
                            href: "https://kaisery.github.io/trpl-zh-cn/ch02-00-guessing-game-tutorial.html"
                        },
                    ]
                },
                {title: "Hello, World!2", href: "https://kaisery.github.io/trpl-zh-cn/ch01-02-hello-world.html"}
            ]
        },
    ])
}
httpServer.listen(httpPort, httpHost);
