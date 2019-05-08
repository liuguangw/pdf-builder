const http = require('http');
const path = require('path');
const fse = require('fs-extra');
const staticHandler = require('serve-handler');
const projectBaseDir = path.resolve(__dirname, "project");
const projectList = [];
const currentProject = {
    info: null
};

function runServer() {
    const srv = http.createServer();
    srv.on("request", (req, res) => {
        staticHandler(req, res, {
            public: path.resolve(__dirname, "../dist"),
        });
    });
    const io = require('socket.io')(srv);
    // 分别定义namespace
    const fetchApiIo = io.of('/fetch-api');
    const vueApiIo = io.of('/vue-api');
    const vueApiCallback = require('./lib/vue_api');
    const fetchApiCallback = require('./lib/fetch_api');
    vueApiIo.on('connect', socket => {
        vueApiCallback(vueApiIo, socket, projectList,currentProject);
    });
    fetchApiIo.on('connect', socket => {
        fetchApiCallback(vueApiIo, fetchApiIo, socket, projectList,currentProject);
    });
    let srvOptions = {
        host: 'localhost',
        port: 5006
    };
    srv.listen(srvOptions, () => {
        console.log("server started at http://" + srvOptions.host + ":" + srvOptions.port + "/");
    });
}

function scanProjectDir(fn) {
    fse.readdir(projectBaseDir, (err, fileList) => {
        if (err) {
            fn(err, []);
        } else {
            let projectItems = [];
            let scanDirFn = (findex) => {
                if (findex < fileList.length) {
                    let absScriptPath = path.resolve(projectBaseDir, fileList[findex], "main.js");
                    fse.stat(absScriptPath, (err, stats) => {
                        if (!err && stats.isFile()) {
                            projectItems.push({
                                dirShort: fileList[findex],
                                dirFull: path.resolve(projectBaseDir, fileList[findex]),
                                script: absScriptPath
                            });
                        }
                        scanDirFn(findex + 1);
                    });
                } else {
                    fn(null, projectItems);
                }
            };
            scanDirFn(0);
        }
    });
}

scanProjectDir((err, projectItems) => {
    if (err) throw err;
    for (let itemIndex in projectItems) {
        projectList.push({
            pathInfo: projectItems[itemIndex],
            moduleInfo: require(projectItems[itemIndex].script)
        });
    }
    //console.log(projectList);
    runServer();
});