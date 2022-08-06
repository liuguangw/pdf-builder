import loadScript from "./load_script.js";

export default async function loadAxios() {
    //加载脚本
    if (!("axios" in window)) {
        //加载js
        await loadScript("https://cdn.jsdelivr.net/npm/axios@0.27.2/dist/axios.min.js");
    }
}
