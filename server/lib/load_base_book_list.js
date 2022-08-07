import kratos from "../projects/kratos/main.js";
import rustbook from "../projects/rustbook/main.js";
import viteBook from "../projects/vite/main.js";
import laravel from "../projects/laravel/main.js";

/**
 * 加载基本的book信息列表
 *
 * @return {Object[]}
 */
export default function loadBaseBookList() {
    return [
        kratos(), rustbook(), viteBook(), laravel()
    ]
}
