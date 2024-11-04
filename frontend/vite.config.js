import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'three',
            '@react-three/fiber',
            '@react-three/drei'
          ],
          mediapipe: ['@mediapipe/tasks-vision']
        }
      }
    },
    chunkSizeWarningLimit: 2000
  }
})

