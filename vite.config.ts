import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth-api': {
        target: 'https://authentication.myco.io',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/auth-api/, ''),
        secure: true,
      },
      '/api': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
    },
  },
})
