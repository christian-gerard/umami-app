import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    // Development mode: enable proxy
    return {
      server: {
        proxy: {
          '/api/v1': ' http://0.0.0.0:10000',
        },
      },
      build: {
        outDir: 'dist',
      },
      plugins: [react()],
    }
  } else {
    // Production mode: no proxy
    return {
      server: {
        proxy: {
          '/api/v1': 'http://127.0.0.1:5555',
        },
      },
      build: {
        outDir: 'dist',
      },
      plugins: [react()],
    }
  }
})
