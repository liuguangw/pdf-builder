export default function () {
    let docURL = "https://learnku.com/docs/laravel/9.x/";
    let projectName = "laravel";
    return {
        docURL,
        contextURL: docURL,
        title: "Laravel 9 中文文档",
        projectName,
        tocXpath: {
            level1: "//h:h1",
            level2: "//h:h2",
            level3: "//h:h3"
        },
        styles: ["css/style.css"]
    };
}
