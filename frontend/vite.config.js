// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

// frontend/vite.config.js - MEJORAR

export default defineConfig({
  plugins: [
    react({
      // ✅ CRÍTICO: Babel runtime optimizado
      babel: {
        compact: true,
        // ✅ Remover propTypes y dead code
        plugins: [
          ['transform-react-remove-prop-types', { removeImport: true }],
          ['@babel/plugin-transform-react-constant-elements'],
          ['@babel/plugin-transform-react-inline-elements']
        ]
      }
    }),
    
    // ✅ Compresión
    viteCompression({ 
      algorithm: 'brotliCompress',
      threshold: 512, // Bajar threshold
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
        passes: 3, // ✅ 3 pasadas
        unsafe_arrows: true, // ✅ Optimizaciones agresivas
        unsafe_methods: true,
      },
      mangle: {
        safari10: true
      },
    },

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ✅ Separación más granular
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
          
          // ✅ Páginas pesadas separadas
          if (id.includes('/pages/Admin')) return 'admin';
          if (id.includes('/pages/Checkout')) return 'checkout';
          if (id.includes('/pages/Shop')) return 'shop';
        },
        
        // ✅ Chunks más pequeños
        chunkFileNames: 'js/[name]-[hash:8].js',
      },

      // ✅ Tree-shaking agresivo
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      }
    },

    // ✅ CRÍTICO: Reducir chunk size
    chunkSizeWarningLimit: 300, // Bajar de 500 a 300
    
    cssCodeSplit: true,
    sourcemap: false,
  },

  // ✅ Optimizar deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      target: 'es2020',
      drop: ['console', 'debugger'], // ✅ Drop en dev también
    }
  }
});
