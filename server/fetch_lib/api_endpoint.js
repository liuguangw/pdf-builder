/**
 * api入口信息
 * @param {string} projectName
 * @return {Object}
 */
export default function apiEndpoint(projectName) {
    //api定义
    const apiPrefix = " http://127.0.0.1:3000";
    return {
        menuApiURL: apiPrefix + "/api/books/" + projectName + "/menu-info",
        contentApiURL: apiPrefix + "/api/books/" + projectName + "/content",
        imageApiURL: apiPrefix + "/api/books/" + projectName + "/images",
        notifyApiURL: apiPrefix + "/api/books/" + projectName + "/can-build"
    }
}
