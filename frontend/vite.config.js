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
    minify: false, // mantenlo así mientras probamos

    rollupOptions: {
      output: {
        // Nombres estables para facilitar debug y evitar colisiones de caché
        chunkFileNames: 'js/[name]-[hash:8].js',
        entryFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8][extname]',

        // Separar vendors en chunks estables que raramente cambian
        // Esto reduce la probabilidad de que un deploy rompa chunks en uso
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react'
            if (id.includes('react-helmet')) return 'vendor-helmet'
            // Todo lo demás de node_modules va a un chunk vendor genérico
            return 'vendor'
          }
        },
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