import { createRouter, createWebHistory, Router, RouteRecordRaw } from 'vue-router'

const BookList = () => import('../views/BookList/BookList.vue')
const BookProject = () => import('../views/BookProject/BookProject.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', component: BookList, name: 'index' },
  { path: '/book/:projectName', component: BookProject, name: 'bookProject' }
]
const router: Router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes // short for `routes: routes`
})
export default router
