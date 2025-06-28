import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Path resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Development server configuration
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT) || 5173,
      host: env.VITE_DEV_SERVER_HOST || 'localhost',
      open: env.VITE_DEV_SERVER_OPEN === 'true',
      hmr: {
        port: parseInt(env.VITE_HMR_PORT) || 24678,
      },
      // CORS configuration for external APIs
      cors: true,
      // Proxy configuration for external services if needed
      proxy: {
        // Add proxy for Google Maps API if needed
        '/maps-api': {
          target: 'https://maps.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/maps-api/, ''),
          secure: true,
        }
      }
    },

    // Build configuration
    build: {
      sourcemap: env.VITE_BUILD_SOURCEMAP === 'true',
      minify: env.VITE_BUILD_MINIFY !== 'false',
      target: env.VITE_BUILD_TARGET || 'es2015',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      chunkSizeWarningLimit: parseInt(env.VITE_CHUNK_SIZE_WARNING_LIMIT) || 1000,
    },

    // Asset configuration
    assetsInclude: ['**/*.lottie'],

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    // Environment variables prefix
    envPrefix: 'VITE_',
  }
})
