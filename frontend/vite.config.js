// frontend/vite.config.js - REEMPLAZAR TODO EL CONTENIDO

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react({
      // ✅ Configuración simplificada sin plugins extra
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
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true
      },
    },

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('react-helmet')) {
              return 'helmet';
            }
            return 'vendor';
          }
          
          if (id.includes('/pages/Admin')) return 'admin';
          if (id.includes('/pages/Checkout')) return 'checkout';
          if (id.includes('/pages/Shop')) return 'shop';
        },
        
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
});