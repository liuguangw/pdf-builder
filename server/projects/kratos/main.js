export default function () {
    let docURL = "https://go-kratos.dev/docs/";
    let projectName = "kratos";
    return {
        docURL,
        title: "Kratos 中文文档",
        projectName,
        tocXpath: {
            level1: "//h:h1",
            level2: "//h:h3",
            level3: "//h:h4"
        },
        styles: ["css/style.css"]
    };
}
