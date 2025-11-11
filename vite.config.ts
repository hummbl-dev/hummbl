import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(), // Split vendor code into separate chunk
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
          // Vendor chunks - split by major dependencies
          if (id.includes('node_modules')) {
            // React MUST be in its own chunk and loaded first
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // React Router depends on React, so separate it
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Zustand uses React hooks
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            // UI libraries that use React
            if (id.includes('lucide-react') || id.includes('@xyflow') || id.includes('@vercel/analytics')) {
              return 'ui-vendor';
            }
            // Other node_modules go to 'vendor'
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
