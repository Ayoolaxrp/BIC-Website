import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules\/(react|react-dom|scheduler)/ },
            { name: 'router', test: /node_modules\/(react-router|@remix-run)/ },
            { name: 'motion', test: /node_modules\/framer-motion/ },
            { name: 'supabase', test: /node_modules\/@supabase/ }
          ]
        }
      }
    }
  }
});
