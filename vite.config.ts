import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Don't use splitVendorChunkPlugin() - we'll do manual splitting
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // Optimize bundle splitting for better caching and faster loads
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep all node_modules in a single vendor chunk to avoid dependency issues
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Adjust chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Minification with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Disable source maps in production for smaller bundles
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
});
