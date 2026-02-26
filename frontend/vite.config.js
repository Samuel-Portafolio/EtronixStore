// frontend/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react({
      babel: {
        compact: true,
        plugins: [
          ['transform-react-remove-prop-types', { removeImport: true }]
        ]
      }
    }),
    
    viteCompression({ 
      algorithm: 'brotliCompress',
      threshold: 512,
    })
  ],

  build: {
    target: 'es2020',
    minify: false,   // mantenlo así mientras probamos

    rollupOptions: {
      // ❌ ELIMINAMOS manualChunks COMPLETO
      // output: {...} queda solo con filename
      output: {
        chunkFileNames: 'js/[name]-[hash:8].js',
      },

      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      }
    },

    chunkSizeWarningLimit: 300,
    cssCodeSplit: true,
    sourcemap: false,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      target: 'es2020',
    }
  }
})
