const express = require("express");
const path = require("path");
const {createServer} = require("http");
const {Server} = require("socket.io");
const httpHost = "127.0.0.1";
const httpPort = 3000;
//编译后的web前端目录
const distPath = path.join(path.dirname(__dirname), "dist");
const staticHandler = express.static(distPath);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */});

io.on("connection", (socket) => {
    // ...
});
app.use(staticHandler);
app.get("/api/hello", (req, res) => {
    res.send('GET request to the hello page');
});
app.use((req, resp) => {
    resp.status(404).send("The requested resource could not be found.");
});
console.log("listen http://" + httpHost + ":" + httpPort);
httpServer.listen(httpPort, httpHost);
