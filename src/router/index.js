import {createRouter, createWebHashHistory} from 'vue-router'
import BookList from "../views/BookList/Index.vue"
import BookProject from "../views/BookProject/Index.vue"

const routes = [
    {path: '/', component: BookList, name: "index"},
    {path: '/book/:projectName', component: BookProject, name: "bookProject"},
]
const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})
export default router
