import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Analizar bundle size
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    }),
    viteCompression({ algorithm: 'brotliCompress'}),
    viteCompression({ algorithm: 'gzip' })
  ],
  build: {
    // Optimizaciones críticas
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.logs en producción
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    rollupOptions: {
      output: {
        // Code splitting optimizado
        manualChunks: {
          // Vendor chunks separados
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-helmet-async'],
          'mercadopago': ['@mercadopago/sdk-react'],
          'ogl': ['ogl'], // LightRays separado (es pesado)
        },
        // Nombres con hash para cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Aumentar límite de warning (opcional)
    chunkSizeWarningLimit: 600,
    // Source maps solo en desarrollo
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimizar servidor de desarrollo
  server: {
    hmr: {
      overlay: false, // Menos intrusivo
    },
  },
  // Pre-bundling optimizado
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mercadopago/sdk-react'
    ],
  }
})