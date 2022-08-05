export default function () {
    let docURL = "https://cn.vitejs.dev/guide/";
    let projectName = "vite";
    return {
        docURL,
        contextURL: "https://cn.vitejs.dev/",
        title: "Vite 官方中文文档",
        projectName,
        tocXpath: {
            level1: "//h:h1",
            level2: "//h:h2",
            level3: "//h:h3"
        },
        styles: ["css/style.css"]
    };
}
