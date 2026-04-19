import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
  },
  build: {
    // 输出到后端 public 目录
    outDir: path.resolve(__dirname, '../server/app/public'),
    // 清空输出目录
    emptyOutDir: true,
  },
  // 使用相对路径，这样前端可以从任意路径访问
  base: './',
})
