import kratos from "../projects/kratos/main.js";
import rustbook from "../projects/rustbook/main.js";
import viteBook from "../projects/vite/main.js";
import laravel from "../projects/laravel/main.js";
import es6Tutorial from "../projects/es6tutorial/main.js";
import wpfTutorial from "../projects/wpf_tutorial/main.js";
import goplBook from "../projects/gopl/main.js"
import advancedGoBook from "../projects/advanced_go/main.js"


/**
 * 加载基本的book信息列表
 *
 * @return {Object[]}
 */
export default function loadBookList() {
    return [
        kratos(), rustbook(), viteBook(), laravel(),
        es6Tutorial(), wpfTutorial(), goplBook(), advancedGoBook()
    ]
}
