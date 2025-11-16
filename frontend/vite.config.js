import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react({
      // ✅ Optimización: Fast Refresh más rápido
      fastRefresh: true,
      // ✅ Babel runtime optimizado
      babel: {
        compact: true,
        plugins: [
          // Remover propTypes en producción
          ['transform-react-remove-prop-types', { removeImport: true }]
        ]
      }
    }),
    
    // Analizar bundle (solo en build con flag)
    process.env.ANALYZE && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    }),
    
    // ✅ Compresión Brotli (mejor que gzip)
    viteCompression({ 
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Solo archivos > 1KB
      deleteOriginFile: false
    }),
    
    // ✅ Compresión Gzip (fallback)
    viteCompression({ 
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024
    })
  ].filter(Boolean),

  build: {
    target: 'es2020', // ✅ Mejor soporte moderno
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // ✅ Dos pasadas de minificación
      },
      mangle: {
        safari10: true // ✅ Fix Safari 10
      },
      format: {
        comments: false // ✅ Remover TODOS los comentarios
      }
    },

    rollupOptions: {
      output: {
        // ✅ OPTIMIZACIÓN CRÍTICA: Code splitting agresivo
        manualChunks: (id) => {
          // Separar node_modules por paquete
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('mercadopago')) {
              return 'mercadopago';
            }
            if (id.includes('ogl')) {
              return 'ogl'; // LightRays separado (pesado)
            }
            if (id.includes('react-helmet')) {
              return 'helmet';
            }
            // Resto de vendors en un chunk aparte
            return 'vendor';
          }
          
          // Separar páginas pesadas
          if (id.includes('/pages/Admin')) {
            return 'admin';
          }
          if (id.includes('/pages/Checkout')) {
            return 'checkout';
          }
        },
        
        // ✅ Nombres con hash corto para mejor caching
        chunkFileNames: 'js/[name]-[hash:8].js',
        entryFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: (assetInfo) => {
          // Organizar assets por tipo
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `img/[name]-[hash:8][extname]`;
          }
          if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `fonts/[name]-[hash:8][extname]`;
          }
          if (ext === 'css') {
            return `css/[name]-[hash:8][extname]`;
          }
          return `assets/[name]-[hash:8][extname]`;
        },

        // ✅ Optimizar imports dinámicos
        inlineDynamicImports: false,
      },

      // ✅ Optimizar tree-shaking
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },

    // ✅ CSS code splitting agresivo
    cssCodeSplit: true,
    
    // ✅ Reducir límite de warning
    chunkSizeWarningLimit: 500,
    
    // ✅ Sourcemaps SOLO en desarrollo
    sourcemap: false,
    
    // ✅ Reportar tamaño comprimido
    reportCompressedSize: true,
    
    // ✅ Assets inline threshold
    assetsInlineLimit: 4096, // 4KB - archivos pequeños inline
  },

  // ✅ Optimizar servidor de desarrollo
  server: {
    hmr: {
      overlay: false,
    },
    // Pre-transformar dependencias comunes
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/pages/Home.jsx',
        './src/pages/Shop.jsx'
      ]
    }
  },

  // ✅ Pre-bundling ultra-optimizado
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-helmet-async'
    ],
    exclude: [
      '@mercadopago/sdk-react', // Lazy load
      'ogl' // LightRays lazy load
    ],
    // ✅ Forzar pre-bundling con esbuild
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  },

  // ✅ Resolver aliases para imports más cortos
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@assets': '/src/assets'
    }
  }
})