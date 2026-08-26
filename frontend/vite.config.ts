import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiTarget = (process.env.VITE_API_URL || 'https://vintage-marketplace-6.onrender.com/api').replace(/\/api\/?$/, '')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/uploads': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
