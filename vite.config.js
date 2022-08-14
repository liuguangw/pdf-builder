import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import builderPlugin from "./server/builder_plugin.js";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), builderPlugin()],
    server: {
        watch: {
            ignored: [
                '**/server/projects/**/dist',
                '**/output',
                '**/.idea'
            ]
        }
    }
})
