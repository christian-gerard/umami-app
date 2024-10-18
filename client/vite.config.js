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
      build: {
        outDir: 'dist',
      },
      plugins: [react()],
    }
  }
})
