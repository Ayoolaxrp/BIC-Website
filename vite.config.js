import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

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
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        // SPA fallback for GitHub Pages: unknown paths serve the app shell.
        '404': fileURLToPath(new URL('./404.html', import.meta.url)),
      },
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
