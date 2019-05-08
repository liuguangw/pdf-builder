function fetchApi(vueIo, fetchIo, socket, projectList, currentProject) {
    console.log("fetch api connected");
    console.log(currentProject);
    socket.on("app save_menu_info", data => {
        if (currentProject.info !== null) {
            let saveSuccessCallback = ()=>{
                vueIo.emit("app save_menu_info", data);
            };
            let saveErrorCallback = (errMessage)=>{
                vueIo.emit("app error", '保存菜单信息失败, ' + errMessage);
            };
            currentProject.info.moduleInfo.saveMenu(data,saveSuccessCallback,saveErrorCallback);
        }
    });
    socket.on("app save_urls", data => {
        vueIo.emit("app save_urls", data);
    });
    socket.on("app save_page_info", data => {
        if (currentProject.info !== null) {
            let saveSuccessCallback = ()=>{
                vueIo.emit("app save_page_url", data.url);
            };
            let saveErrorCallback = (errMessage)=>{
                vueIo.emit("app error", '保存 ' + data.title + "(" + data.url + ") 失败, " + errMessage);
            };
            currentProject.info.moduleInfo.savePage(data.url, data.title, data.content,saveSuccessCallback,saveErrorCallback);
        }
    });
    socket.on('disconnect', () => {
        console.log("fetch api disconnected");
    });
}

module.exports = fetchApi;