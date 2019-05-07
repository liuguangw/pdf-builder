import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import ProjectInfo from "./views/ProjectInfo";

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/project/:projectName',
            name: 'projectInfo',
            component: ProjectInfo
        }
    ]
})
