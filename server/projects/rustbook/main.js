export default function () {
    let docURL = "https://kaisery.github.io/trpl-zh-cn/";
    let projectName = "rustbook";
    return {
        docURL,
        contextURL: docURL,
        title: "Rust 程序设计语言",
        projectName,
        styles:["css/style.css","css/highlightjs.css"]
    };
}
