import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    proxy: {
      '/api': {
        target: 'http://localhost:6969',
        changeOrigin: true,
        secure: false,
        ws: false,
      }
    }
  },
  plugins: [react()],
})
