export default function () {
    let docURL = "https://es6.ruanyifeng.com/";
    let projectName = "es6tutorial";
    return {
        docURL,
        contextURL: docURL,
        title: "ES6 入门教程",
        projectName,
        tocXpath: {
            level1: "//h:h1",
            level2: "//h:h2",
            level3: "//h:h3"
        },
        styles: ["css/style.css", "css/code.css"]
    };
}
