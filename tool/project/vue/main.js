let bookMetaInfo = require("./source/config");
/**
 * 用于返回文档信息
 * @type {(function(): Object)|*}
 */
module.exports.bookMetaInfo = bookMetaInfo;
/**
 * 文档构建前的预处理工具
 */
module.exports.buildBook = () => {
    console.log(bookMetaInfo());
};