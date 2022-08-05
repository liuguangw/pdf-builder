import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            '/api': 'http://127.0.0.1:3000',
            '/socket.io': {
                target: 'ws://127.0.0.1:3000',
                ws: true
            }
        }
    }
})
