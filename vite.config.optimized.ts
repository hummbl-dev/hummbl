import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(), // Split vendor code into separate chunk
  ],
  build: {
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@xyflow/react'],
          'state-vendor': ['zustand'],
          
          // Feature chunks - group by domain
          'workflow-features': [
            './src/pages/WorkflowList.tsx',
            './src/pages/WorkflowDetail.tsx',
            './src/pages/WorkflowEditorFull.tsx',
            './src/services/workflowRunner.ts',
          ],
          'agent-features': [
            './src/pages/AgentManagement.tsx',
            './src/config/agentPresets.ts',
          ],
          'analytics-features': [
            './src/pages/Analytics.tsx',
            './src/pages/ExecutionMonitor.tsx',
            './src/pages/TokenUsage.tsx',
          ],
          'settings-features': [
            './src/pages/Settings.tsx',
            './src/pages/APIKeys.tsx',
            './src/pages/TeamMembers.tsx',
          ],
        },
      },
    },
    // Adjust chunk size warning limit (we're optimizing, so increase threshold)
    chunkSizeWarningLimit: 600,
    // Minification options
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
    // Source maps for production debugging
    sourcemap: false, // Disable to reduce bundle size
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
});
