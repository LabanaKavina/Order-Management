import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/menu': {
        target: 'http://localhost:3001/api',
        changeOrigin: true,
      },
      '/orders': {
        target: 'http://localhost:3001/api',
        changeOrigin: true,
      },
    },
  },
})
