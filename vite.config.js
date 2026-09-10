import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Happy_Birthday/',
  server: {
    host: true,
    allowedHosts: true, // Allow all hosts (including ngrok)
    port: 5173,
    strictPort: true
  }
})
