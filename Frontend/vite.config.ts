import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // fileURLToPath rather than URL.pathname: on Windows the latter yields "/C:/..."
    // which does not resolve.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // The Spring Boot API runs on 8081. Proxying keeps the browser same-origin in
    // development, so cookies and CORS behave the way they will behind a gateway.
    proxy: {
      '/api': { target: 'http://localhost:8081', changeOrigin: true },
    },
  },
})
