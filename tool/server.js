const http = require('http');
const path = require('path');
const fse = require('fs-extra');
const staticHandler = require('serve-handler');
const projectBaseDir = path.resolve(__dirname, "project");
const projectList = [];
let currentProject = null;

function successResponse(data) {
    return {
        code: 0,
        data: data,
        message: null
    };
}

function errorResponse(errorMessage) {
    return {
        code: 500,
        data: null,
        message: errorMessage
    };
}

function runServer() {
    const srv = http.createServer();
    srv.on("request", (req, res) => {
        staticHandler(req, res, {
            public: path.resolve(__dirname, "../dist"),
        });
    });
    const io = require('socket.io')(srv);
    io.on('connection', client => {
        client.on('app list_project', _ => {
            let resultList = [];
            for (let itemIndex in projectList) {
                let projectInfo = projectList[itemIndex];
                resultList.push({
                    dir: projectInfo.pathInfo.dirShort,
                    name: projectInfo.moduleInfo.bookMetaInfo().title
                });
            }
            client.emit('app list_project', resultList);
        });
        client.on("app save_menu_info", data => {
            console.log(data);
        });
        client.on("app save_page_info", data => {
            console.log(data);
        });
        client.on('disconnect', () => {
            console.log("user disconnected");
        });
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
    console.log(projectList);
    runServer();
});