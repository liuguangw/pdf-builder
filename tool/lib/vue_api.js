const buildFn = require("./build");

function vueApi(vueIo, socket, projectList, currentProject) {
    console.log("vue api connected");
    let successResponse = (eventName, data) => {
        socket.emit(eventName, {
            code: 0,
            data: data,
            message: null
        });
    };
    let errorResponse = (eventName, errorMessage) => {
        socket.emit(eventName, {
            code: -1,
            data: null,
            message: errorMessage
        });
    };
    socket.on('app list_project', _ => {
        let resultList = [];
        for (let itemIndex in projectList) {
            let projectInfo = projectList[itemIndex];
            resultList.push({
                dir: projectInfo.pathInfo.dirShort,
                full_path: projectInfo.pathInfo.dirFull,
                name: projectInfo.moduleInfo.bookMetaInfo().title
            });
        }
        socket.emit('app list_project', resultList);
    });
    socket.on('app select_project', projectDir => {
        let evtName = 'app select_project';
        let tmpProject = null;
        for (let itemIndex in projectList) {
            let projectInfo = projectList[itemIndex];
            if (projectInfo.pathInfo.dirShort === projectDir) {
                tmpProject = projectInfo;
            }
        }
        if (tmpProject !== null) {
            currentProject.info = tmpProject;
            successResponse(evtName, projectDir);
        } else {
            errorResponse(evtName, "不存在project: " + projectDir);
        }

    });
    socket.on("app build", () => {
        if (currentProject.info !== null) {
            let addMessageFn = (appMessage) => {
                socket.emit("app message", appMessage);
            };
            let addErrorFn = (errMessage) => {
                socket.emit("app error", errMessage);
            };
            let buildCompleteFn = () => {
                socket.emit("app build_complete");
            };
            let buildInfo = currentProject.info.moduleInfo.bookMetaInfo();
            buildFn(buildInfo, addMessageFn, addErrorFn, buildCompleteFn);
        }
    });
    socket.on('disconnect', () => {
        console.log("vue api disconnected");
    });
}

module.exports = vueApi;