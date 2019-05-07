function fetchApi(vueIo, fetchIo, socket, projectList, currentProject) {
    console.log("fetch api connected");
    console.log(currentProject);
    socket.on("app save_menu_info", data => {
        //todo save
        vueIo.emit("app save_menu_info", data);
    });
    socket.on("app save_urls", data => {
        vueIo.emit("app save_urls", data);
    });
    socket.on("app save_page_info", data => {
        if (currentProject !== null) {
            try {
                currentProject.info.moduleInfo.savePage(data.url, data.title, data.content);
                vueIo.emit("app save_page_url", data.url);
                //@todo 待修改为回调方式
            } catch (e) {
                vueIo.emit("app error", '保存 ' + data.title + "(" + data.url + ") 失败, " + e.message);
            }
        }
    });
    socket.on('disconnect', () => {
        console.log("fetch api disconnected");
    });
}

module.exports = fetchApi;